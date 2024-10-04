import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';

import { ErrorCodes, Result } from '../../_shared/common/models/result';
import { DataHandler, SentryLogger } from '../../_shared/common/providers';
import { ExchangeRateService } from '../exchange-rates/exchange-rate.service';
import { Notifications } from '../notifications/schemas';
import { UserSession } from '../users/schemas';
import { isIncludedSite } from './helpers/promotion-helper';
import { PromotionDetailViewModel, PromotionViewModel } from './models/promotion-configs-response';
import { CurrencyGroup, PROMOTION_STATUSES, PromotionConfigs, PromotionConfigsDocument, WinningPrize } from './schemas';

@Injectable()
export class PromotionConfigService {
    constructor(
        @InjectModel(PromotionConfigs.name) private readonly model: Model<PromotionConfigsDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
        @Inject(ExchangeRateService) private readonly exchangeRateService: ExchangeRateService,
        @Inject(SentryLogger) private readonly logger: SentryLogger
    ) { }

    async getPromotionsByStatus(status: string): Promise<Result<PromotionConfigs[]>> {
        const execution = this.model.find({ status }).lean().exec();
        return this.dataHandler.getData(execution);
    }

    async updatePromotionStatus(promotionId: number, status: string): Promise<Result<PromotionConfigs>> {
        const filter = { promotionId };
        const updates = { status: status, updatedTime: new Date() };

        return this.dataHandler.updateData(this.model, filter, updates);
    }

    async getById(id: number, currencyGroupId: string): Promise<Result<LeanDocument<PromotionConfigsDocument>>> {
        const filter = {
            'operators.currencyGroups': { $elemMatch: { enabled: true, currencyGroupId: currencyGroupId } },
            promotionId: id,
        };
        const execution = this.model.findOne(filter).lean().exec();

        const promotion = await this.dataHandler.getData(execution);
        console.log(promotion)
        if (promotion?.data) {
            return new Result(ErrorCodes.Success, '', promotion?.data);
        }
        return new Result(ErrorCodes.Failed, '');
    }

    async getByPromotionId(promotionId: number): Promise<Result<PromotionConfigs>> {
        const filter = {
            promotionId,
        };
        const execution = this.model.findOne(filter).lean().exec();

        return this.dataHandler.getData(execution);
    }

    async getBySession(session: UserSession): Promise<Result<LeanDocument<PromotionConfigsDocument>[]>> {
        const filter = {
            operators: {
                $elemMatch: {
                    operatorId: session.operatorId,
                    currencyGroups: { $elemMatch: { enabled: true, currencyGroupId: session.currencyGroupId } },
                },
            },
            status: { $ne: PROMOTION_STATUSES.deleted },
        };
        const execution = this.model
            .find(filter)
            .sort([['startDateTime', -1]])
            .lean()
            .exec();

        const promotions = await this.dataHandler.getData(execution);
        if (promotions?.data?.length > 0) {
            const data = promotions?.data.filter((promotion) => isIncludedSite(promotion, session));
            return new Result(ErrorCodes.Success, '', data);
        }
        return new Result(ErrorCodes.Success, '', []);
    }

    getPromotionsByNotifications(
        promotions: LeanDocument<PromotionConfigsDocument>[],
        notifications: Notifications[],
        lang = 'en-US',
    ): PromotionViewModel[] {
        const promotionViewModels: PromotionViewModel[] = [];
        if (notifications.length > 0) {
            promotions.forEach((promotion) => {
                notifications.forEach((notification) => {
                    if (promotion._id?.toString() === notification.promotionId) {
                        promotionViewModels.push(
                            new PromotionViewModel(
                                promotion.promotionId,
                                notification.title[lang],
                                notification.messages[lang],
                                promotion.startDateTime,
                                promotion.endDateTime,
                            ),
                        );
                    }
                });
            });
        }
        const sortByStatusThenTime = (a: PromotionViewModel, b: PromotionViewModel): number =>
            a.status - b.status || b.startDateTime.getTime() - a.startDateTime.getTime();
        promotionViewModels.sort(sortByStatusThenTime);

        return promotionViewModels;
    }

    async getPromotionDetail(
        promotion: LeanDocument<PromotionConfigsDocument>,
        session: UserSession,
        title: string,
    ): Promise<PromotionDetailViewModel> {
        const { startDateTime, endDateTime, winningPrizes, operators } = promotion;
        let currencyGroup: CurrencyGroup;
        operators.forEach((operator) => {
            operator.currencyGroups.forEach((cg) => {
                if (cg.currencyGroupId === session.currencyGroupId) {
                    currencyGroup = cg;
                }
            });
        });
        const exchangeRate = (await this.exchangeRateService.getExchangeRateById(promotion.exId)).data;
        const convertValueToUserCurrency = (value) => (1 / (exchangeRate.code[session.currencyCode] * session.multiplier)) * value;

        winningPrizes.forEach((winningPrize) => {
            winningPrize.value = convertValueToUserCurrency(winningPrize.value);
        });

        return new PromotionDetailViewModel(
            title,
            startDateTime,
            endDateTime,
            currencyGroup.otherGameMinBet,
            currencyGroup.slotGameMinBet,
            winningPrizes as WinningPrize[],
        );
    }

    async isExistedNewOrRunningPromotionTournament(session: UserSession): Promise<boolean> {
        this.logger.log(`session: ${JSON.stringify(session)}`);
        console.log(`session: ${JSON.stringify(session)}`);

        const promotions = await this.getNewOrRunningPromotion(session);
        this.logger.log(`promotions count: ${JSON.stringify(promotions?.data?.length)}`);
        console.log(`promotions count: ${JSON.stringify(promotions?.data?.length)}`);

        if (promotions?.data?.length > 0) {
            return promotions?.data.filter((promotion) => isIncludedSite(promotion, session)).length > 0;
        }

        return false;
    }

    async getPromotionDetailIdEntry(session: UserSession): Promise<number> {
        const promotions = await this.getNewOrRunningPromotion(session);

        if (promotions?.data?.length > 0) {
            const data = promotions?.data.filter((promotion) => isIncludedSite(promotion, session));
            return data.length === 1 ? data[0].promotionId : 0;
        }

        return 0;
    }

    private async getNewOrRunningPromotion(session: UserSession): Promise<Result<LeanDocument<PromotionConfigsDocument>[]>> {
        const filter = {
            operators: {
                $elemMatch: {
                    operatorId: session.operatorId,
                    currencyGroups: { $elemMatch: { enabled: true, currencyGroupId: session.currencyGroupId } },
                },
            },
            status: { $in: [PROMOTION_STATUSES.new, PROMOTION_STATUSES.running] },
        };
        const execution = this.model
            .find(filter)
            .sort([['startDateTime', -1]])
            .lean()
            .exec();

        return this.dataHandler.getData(execution);
    }
}
