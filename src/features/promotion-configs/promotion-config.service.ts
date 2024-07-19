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
import { CurrencyGroup, PromotionConfigs, PromotionConfigsDocument, WinningPrize } from './schemas';

@Injectable()
export class PromotionConfigService {
    constructor(
        @InjectModel(PromotionConfigs.name) private readonly model: Model<PromotionConfigsDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
        @Inject(ExchangeRateService) private readonly exchangeRateService: ExchangeRateService,

        private readonly logger: SentryLogger,
    ) {}

    async getAll(): Promise<Result<PromotionConfigs[]>> {
        const execution = this.model.find({}).lean().exec();
        return this.dataHandler.getData(execution);
    }

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
        if (promotion?.data) {
            return new Result(ErrorCodes.Success, '', promotion?.data);
        }
        return new Result(ErrorCodes.Failed, '');
    }

    async getBySession(session: UserSession): Promise<Result<LeanDocument<PromotionConfigsDocument>[]>> {
        const filter = {
            operators: {
                $elemMatch: {
                    operatorId: session.operatorId,
                    currencyGroups: { $elemMatch: { enabled: true, currencyGroupId: session.currencyGroupId } },
                },
            },
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
        lang: string = 'en-US',
    ): PromotionViewModel[] {
        let result: PromotionViewModel[] = [];
        if (notifications.length > 0) {
            promotions.forEach((promotion) => {
                notifications.forEach((notification) => {
                    if (promotion._id?.toString() == notification.promotionId) {
                        result.push(
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
        result.sort(sortByStatusThenTime);

        return result;
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
                if (cg.currencyGroupId == session.currencyGroupId) {
                    currencyGroup = cg;
                }
            });
        });
        const exchangeRate = (await this.exchangeRateService.getAll()).data;
        const convertValueToUserCurrency = (value) => (1 / (exchangeRate.code[session.currencyCode] * session.multiplier)) * value;

        winningPrizes.forEach((winningPrize) => {
            winningPrize.value = convertValueToUserCurrency(winningPrize.value);
        });

        const result: PromotionDetailViewModel = new PromotionDetailViewModel(
            title,
            startDateTime,
            endDateTime,
            currencyGroup.otherGameMinBet,
            currencyGroup.slotGameMinBet,
            winningPrizes as WinningPrize[],
        );
        return result;
    }
}
