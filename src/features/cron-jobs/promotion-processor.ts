import { Inject } from '@nestjs/common';
import { PromotionBetService } from '../promotion-bets/promotion-bet.service';
import { PromotionConfigService } from '../promotion-configs/promotion-config.service';
import { LeaderBoardService } from '../promotion-leader-boards/leader-board.service';
import { PromotionRunService } from '../promotion-runs/promotion-run.service';
import { PromotionRuns } from '../promotion-runs/schemas';
import { ConfigByCurrencyGroup, CurrencyGroup, Operator, PROMOTION_STATUSES, PromotionConfigs } from '../promotion-configs/schemas';
import { ExchangeRateService } from '../exchange-rates/exchange-rate.service';
import { ExchangeRates } from '../exchange-rates/schemas';
import { GameConfigService } from '../game-configs/game-config.service';
import { GameConfigs, SLOT_GAME_TYPES } from '../game-configs/schemas';
import { PromotionBets } from '../promotion-bets/schemas';
import { PromotionLeaderBoards } from '../promotion-leader-boards/schemas';
import { SentryLogger } from '../../_shared/common/providers';

export class PromotionProcessor {
    constructor(
        @Inject(SentryLogger) private readonly logger: SentryLogger,
        @Inject(PromotionConfigService) private readonly promotionConfigService: PromotionConfigService,
        @Inject(LeaderBoardService) private readonly leaderBoardService: LeaderBoardService,
        @Inject(PromotionRunService) private readonly promotionRunService: PromotionRunService,
        @Inject(PromotionBetService) private readonly promotionBetService: PromotionBetService,
        @Inject(ExchangeRateService) private readonly exchangeRateService: ExchangeRateService,
        @Inject(GameConfigService) private readonly gameConfigService: GameConfigService,
    ) {}

    async proceed() {
        try {
            console.log('proceed', new Date().toISOString());
            const startTime = new Date();
            await this.promotionBetService.syncEndGameLog();
            await this.processNewPromotions();
            await this.processRunningPromotions();
            await this.processFinishedPromotions();
            console.log('proceeded in ', (new Date().getTime() - startTime.getTime()) / 1000, startTime, new Date());
        } catch (errors) {
            console.log(errors);
            this.logger.error(errors);
        }
    }

    async processNewPromotions() {
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.new);
        const currentTime = this.getCurrentTime();
        for (const promotionConfig of result.data) {
            if (promotionConfig.startDateTime <= currentTime && currentTime <= promotionConfig.endDateTime) {
                const newPromotionRun = new PromotionRuns();
                newPromotionRun.promotionId = promotionConfig.promotionId;
                newPromotionRun.latestRunTime = this.getCurrentTime();
                newPromotionRun.promotionConfigs = JSON.stringify(promotionConfig);

                await this.promotionRunService.create(newPromotionRun);
                await this.promotionConfigService.updatePromotionStatus(promotionConfig.promotionId, PROMOTION_STATUSES.running);
            }
        }
    }

    async processFinishedPromotions() {
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.running);
        for (const promotionConfig of result.data) {
            try {
                const sealedPromotionConfig = await this.getSealedPromotionConfig(promotionConfig);
                if (new Date(sealedPromotionConfig.endDateTime) < this.getCurrentTime()) {
                    await this.updateAwardedAmount(promotionConfig);
                    await this.promotionConfigService.updatePromotionStatus(promotionConfig.promotionId, PROMOTION_STATUSES.completed);
                    await this.promotionRunService.updateLatestRunTime(promotionConfig.promotionId);
                    await this.updateChecksum(sealedPromotionConfig);
                }
            } catch (e) {
                this.logger.error(e);
            }
        }
    }

    async updateAwardedAmount(promotionConfigs: PromotionConfigs) {
        const awards = promotionConfigs.winningPrizes.reduce((accumulator, currentValue) => {
            if (currentValue.ranking.includes('-')) {
                const ranks = currentValue.ranking.split('-');
                const fromRank = +ranks[0];
                const toRank = +ranks[1];
                for (let i = 0; i < toRank - fromRank + 1; i++) {
                    accumulator.push(currentValue.value);
                }
            } else {
                accumulator.push(currentValue.value);
            }

            return accumulator;
        }, []);

        const topLeaderBoard = await this.leaderBoardService.getTopLeaderBoard(promotionConfigs.promotionId, awards.length);
        for (let i = 0; i < topLeaderBoard.data.length; i++) {
            const leaderBoard = topLeaderBoard.data[i];
            const awardedInPlayerCurrency = await this.convertWinningAmountToPlayerCurrency(
                awards[i],
                leaderBoard.currencyCode,
                leaderBoard.multiplier,
            );
            this.leaderBoardService.updateAwardAmount(leaderBoard, awards[i], awardedInPlayerCurrency);
        }
    }

    async convertWinningAmountToPlayerCurrency(amount: number, currencyCode: string, multiplier: number) {
        const exchangeRate = await this.exchangeRateService.getAll();
        return amount / (exchangeRate.data.code[currencyCode] * multiplier);
    }

    async getSealedPromotionConfig(sourcePromotionConfigs: PromotionConfigs) {
        const promotionRunResult = await this.promotionRunService.getByPromotionId(sourcePromotionConfigs.promotionId);
        return JSON.parse(promotionRunResult.data.promotionConfigs) as PromotionConfigs;
    }

    async processRunningPromotions() {
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.running);
        const exchangeRate = await this.exchangeRateService.getAll();
        const gameConfigs = await this.gameConfigService.getAll();
        for (const promotion of result.data) {
            try {
                await this.processRunningPromotion(promotion, gameConfigs.data, exchangeRate.data);
                await this.promotionRunService.updateLatestRunTime(promotion.promotionId);
            } catch (e) {
                this.logger.error(e);
            }
        }
    }

    getConfigsByCurrencyGroup(promotionConfig: PromotionConfigs) {
        const configByCurrencyGroup: { [key: string]: ConfigByCurrencyGroup } = {};
        for (const operator of promotionConfig.operators) {
            for (const currencyGroup of operator.currencyGroups) {
                if (currencyGroup.enabled) {
                    configByCurrencyGroup[currencyGroup.currencyGroupId] = {
                        currencyGroupId: currencyGroup.currencyGroupId,
                        otherGameMinBet: currencyGroup.otherGameMinBet,
                        slotGameMinBet: currencyGroup.slotGameMinBet,
                        includedSiteNames: operator.includedSiteNames,
                    };
                }
            }
        }

        console.log(configByCurrencyGroup);
        return configByCurrencyGroup;
    }

    async processRunningPromotion(promotion: PromotionConfigs, gameConfigs: GameConfigs[], exchangeRate: ExchangeRates) {
        const promotionConfig = await this.getSealedPromotionConfig(promotion);
        const latestDataSourceTimeStamp = await this.leaderBoardService.getLatestDataSourceTimeStamp(promotionConfig.promotionId);
        const ticketResult = await this.promotionBetService.getBets(
            new Date(promotionConfig.startDateTime),
            new Date(promotionConfig.endDateTime),
            latestDataSourceTimeStamp,
        );

        console.log('ticketResult', ticketResult.data.length, new Date().toISOString());
        const configsByCurrencyGroup = this.getConfigsByCurrencyGroup(promotionConfig);
        const leaderBoardsObj: { [key: string]: PromotionLeaderBoards } = {};
        for (const ticket of ticketResult.data) {
            const leaderBoard = this.processTicket(promotion.promotionId, gameConfigs, configsByCurrencyGroup, ticket, exchangeRate);
            if (leaderBoard) {
                const key = `${leaderBoard.promotionId}_${leaderBoard.operatorId}_${leaderBoard.playerId}`;
                if (leaderBoardsObj[key]) {
                    leaderBoardsObj[key].point += leaderBoard.point;
                    leaderBoardsObj[key].pointInBaseCurrency += leaderBoard.pointInBaseCurrency;
                    leaderBoardsObj[key].dataSourceTimeStamp = leaderBoard.dataSourceTimeStamp;
                } else {
                    leaderBoardsObj[key] = leaderBoard;
                }
            }
        }

        await this.leaderBoardService.bulkWrite(this.sortLeaderBoards(leaderBoardsObj));
    }

    sortLeaderBoards(leaderBoardsObj: { [key: string]: PromotionLeaderBoards }) {
        return Object.values(leaderBoardsObj).sort((a, b) => a.dataSourceTimeStamp.getTime() - b.dataSourceTimeStamp.getTime());
    }

    processTicket(
        promotionId: number,
        gameConfigs: GameConfigs[],
        configsByCurrencyGroup: { [key: string]: ConfigByCurrencyGroup },
        ticket: PromotionBets,
        exchangeRate: ExchangeRates,
    ) {
        if (this.isValidTicket(configsByCurrencyGroup, ticket, gameConfigs)) {
            const leaderBoard = new PromotionLeaderBoards();
            leaderBoard.promotionId = promotionId;
            leaderBoard.playerId = ticket.playerId;
            leaderBoard.operatorId = ticket.operatorId;
            leaderBoard.siteName = ticket.siteName;
            leaderBoard.currencyGroupId = ticket.currencyGroupId;
            leaderBoard.currency = ticket.currencyName;
            leaderBoard.point = this.calculatePoint(ticket);
            leaderBoard.pointInBaseCurrency = this.calculatePointInBaseCurrency(exchangeRate, ticket);
            leaderBoard.dataSourceTimeStamp = ticket.dataSourceTimeStamp;
            leaderBoard.nickName = ticket.nickname;
            leaderBoard.siteId = ticket.siteId;
            leaderBoard.playerName = ticket.playerName;
            leaderBoard.isTestCurrency = ticket.isTestCurrency;
            leaderBoard.currencyCode = ticket.currencyCode;
            leaderBoard.multiplier = ticket.multiplier;
            leaderBoard.updatedTime = new Date();

            return leaderBoard;
        }

        return null;
    }

    calculatePoint(ticket: PromotionBets) {
        return (ticket.totalWin - ticket.totalAmount) / 100;
    }

    calculatePointInBaseCurrency(exchangeRate: ExchangeRates, ticket: PromotionBets) {
        return this.calculatePoint(ticket) * exchangeRate.code[ticket.currencyCode] * ticket.multiplier;
    }

    isSiteNameIncluded(includedSiteNames: string, siteName: string) {
        return !includedSiteNames || includedSiteNames.replace(' ', '').split(',').includes(siteName);
    }

    isValidMinBet(gameConfigs: GameConfigs[], configByCurrencyGroup: ConfigByCurrencyGroup, ticket: PromotionBets) {
        const gameType = gameConfigs.find((config) => config.gameId === ticket.gameId)?.type;
        const minBet = SLOT_GAME_TYPES.includes(gameType) ? configByCurrencyGroup.slotGameMinBet : configByCurrencyGroup.otherGameMinBet;
        return ticket.validBetAmount >= minBet;
    }

    getCurrentTime() {
        return new Date();
    }

    isValidTicket(configsByCurrencyGroup: { [key: string]: ConfigByCurrencyGroup }, ticket: PromotionBets, gameConfigs: GameConfigs[]) {
        const configByCurrencyGroup = configsByCurrencyGroup[ticket.currencyGroupId];
        return (
            configByCurrencyGroup &&
            ticket.totalWin > ticket.totalAmount &&
            this.isValidMinBet(gameConfigs, configByCurrencyGroup, ticket) &&
            this.isSiteNameIncluded(configByCurrencyGroup.includedSiteNames, ticket.siteName)
        );
    }

    async updateChecksum(promotionConfig: PromotionConfigs) {
        const gameConfigs = await this.gameConfigService.getAll();
        const configsByCurrencyGroup = this.getConfigsByCurrencyGroup(promotionConfig);
        const topLeaderBoard = await this.leaderBoardService.getTopLeaderBoardWithTestCurrency(promotionConfig.promotionId, 10);
        for (const leaderBoard of topLeaderBoard.data) {
            const ticketResult = await this.promotionBetService.getBetsByPlayer(
                new Date(promotionConfig.startDateTime),
                new Date(promotionConfig.endDateTime),
                leaderBoard.operatorId,
                leaderBoard.playerId,
            );

            let checksumPoint = 0;
            for (const ticket of ticketResult.data) {
                if (this.isValidTicket(configsByCurrencyGroup, ticket, gameConfigs.data)) {
                    checksumPoint += this.calculatePoint(ticket);
                }
            }

            await this.leaderBoardService.updateChecksumPoint(leaderBoard, checksumPoint);
        }
    }
}
