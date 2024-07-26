import { isSiteNameIncluded } from '../../../src/_shared/helpers';
import { ExchangeRates } from '../exchange-rates/schemas';
import { GameConfigs, SLOT_GAME_TYPES } from '../game-configs/schemas';
import { PromotionBets } from '../promotion-bets/schemas';
import { ConfigByCurrencyGroup, PromotionConfigs } from '../promotion-configs/schemas';
import { PromotionLeaderBoards } from '../promotion-leader-boards/schemas';

export const roundNumber = (value: number, fractionDigits = 10) => {
    return +value.toFixed(fractionDigits);
};

export const calculatePoint = (bet: PromotionBets) => {
    return roundNumber((bet.totalWin - bet.totalAmount) / 100);
};

export const calculatePointInBaseCurrency = (exchangeRate: ExchangeRates, bet: PromotionBets) => {
    return roundNumber(calculatePoint(bet) * exchangeRate.code[bet.currencyCode] * bet.multiplier);
};

export const isValidMinBet = (gameConfigs: GameConfigs[], configByCurrencyGroup: ConfigByCurrencyGroup, bet: PromotionBets) => {
    const gameType = gameConfigs.find((config) => config.gameId === bet.gameId)?.type;
    const minBet = SLOT_GAME_TYPES.includes(gameType) ? configByCurrencyGroup.slotGameMinBet : configByCurrencyGroup.otherGameMinBet;
    return bet.validBetAmount >= minBet;
};

export const getCurrentTime = () => {
    return new Date();
};

export const getConfigsByCurrencyGroup = (promotionConfig: PromotionConfigs) => {
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

    return configByCurrencyGroup;
};

export const isValidBet = (
    configsByCurrencyGroup: { [key: string]: ConfigByCurrencyGroup },
    bet: PromotionBets,
    gameConfigs: GameConfigs[],
) => {
    const configByCurrencyGroup = configsByCurrencyGroup[bet.currencyGroupId];
    return (
        configByCurrencyGroup &&
        bet.totalWin > bet.totalAmount &&
        isValidMinBet(gameConfigs, configByCurrencyGroup, bet) &&
        isSiteNameIncluded(configByCurrencyGroup.includedSiteNames, bet.siteName)
    );
};

export const convertWinningAmountToPlayerCurrency = (
    amount: number,
    currencyCode: string,
    multiplier: number,
    exchangeRate: ExchangeRates,
) => {
    return Math.trunc(amount / (exchangeRate.code[currencyCode] * multiplier));
};

export const sortLeaderBoards = (leaderBoardsObj: { [key: string]: PromotionLeaderBoards }) => {
    return Object.values(leaderBoardsObj).sort((a, b) => a.dataSourceTimeStamp.getTime() - b.dataSourceTimeStamp.getTime());
};

export const getAwards = (promotionConfigs: PromotionConfigs) => {
    return promotionConfigs.winningPrizes.reduce((accumulator, currentValue) => {
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
};

export const formatPromotionNotification = (title: string, startTime: Date, endTime: Date) => {
    return `the {{BeginBold}}${title}{{EndBold}} {{NewLine}}{{BeginBold}}From:{{EndBold}} ${formatDateTime(startTime)} {{NewLine}}{{BeginBold}}To      :{{EndBold}} ${formatDateTime(endTime)}`;
};

export const formatStartNotification = (title: string, startTime: Date, endTime: Date) => {
    return `Start ${formatPromotionNotification(title, startTime, endTime)}`;
};

export const formatFinishNotification = (title: string, startTime: Date, endTime: Date) => {
    return `Finish ${formatPromotionNotification(title, startTime, endTime)}`;
};

export const formatDateTime = (dateTime: Date) => {
    return `${dateTime.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })} GMT+7`;
};
