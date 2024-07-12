import { Inject } from '@nestjs/common';
import { PromotionBetService } from '../promotion-bets/promotion-bet.service';
import { PromotionConfigService } from '../promotion-configs/promotion-config.service';
import { LeaderBoardService } from '../promotion-leader-boards/leader-board.service';
import { PromotionRunService } from '../promotion-runs/promotion-run.service';
import { TicketSiloService } from '../ticket-silos/ticket-silo.service';
import { UserSessionsService } from '../users/services/user-session.service';
import { PromotionRuns } from '../promotion-runs/schemas';
import { PROMOTION_STATUSES } from '../promotion-configs/schemas';

export class PromotionProcessor {
    constructor(
        //private readonly logger: SentryLogger,
        @Inject(PromotionConfigService) private readonly promotionConfigService: PromotionConfigService,
        @Inject(TicketSiloService) private readonly ticketSiloService: TicketSiloService,
        @Inject(UserSessionsService) private readonly userSessionService: UserSessionsService,
        @Inject(LeaderBoardService) private readonly leaderBoardService: LeaderBoardService,
        @Inject(PromotionRunService) private readonly promotionRunService: PromotionRunService,
        @Inject(PromotionBetService) private readonly promotionBetService: PromotionBetService,
    ) {}

    async proceed() {
        try {
            console.log('proceed');
            await this.processNewPromotions();
            await this.processRunningPromotions();
        } catch (errors) {
            console.log(errors);
        }
    }

    async processNewPromotions() {
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.new);
        const currentTime = new Date();
        for (const promotionConfig of result.data) {
            if (promotionConfig.startDateTime <= currentTime && currentTime <= promotionConfig.endDateTime) {
                const newPromotionRun = new PromotionRuns();
                newPromotionRun.promotionId = promotionConfig.promotionId;
                newPromotionRun.isJobRunning = false;
                newPromotionRun.latestRunTime = new Date();
                newPromotionRun.promotionBetPosition = {};
                newPromotionRun.promotionLeaderBoardPosition = {};
                newPromotionRun.updatedTime = new Date();
                newPromotionRun.promotionConfigs = JSON.stringify(promotionConfig);

                await this.promotionRunService.create(newPromotionRun);
                await this.promotionConfigService.markPromotionRunning(promotionConfig.promotionId);
            }
        }
    }

    async processRunningPromotions() {
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.running);
        const currentTime = new Date();
        for (const promotion of result.data) {
            const promotionRunResult = await this.promotionRunService.getByPromotionId(promotion.promotionId);
            const promotionConfig = JSON.parse(promotionRunResult.data.promotionConfigs);
            console.log('process', promotionConfig);
        }
    }

    manipulateDataForRunningPromotion() {
        // use promotionConfigs from promotionRun
    }

    updatePromotionStatusSettled() {}
}
