import { Inject } from '@nestjs/common';
import { PromotionBetService } from '../promotion-bets/promotion-bet.service';
import { PromotionConfigService } from '../promotion-configs/promotion-config.service';
import { LeaderBoardService } from '../promotion-leader-boards/leader-board.service';
import { PromotionRunService } from '../promotion-runs/promotion-run.service';
import { TicketSiloService } from '../ticket-silos/ticket-silo.service';
import { UserSessionsService } from '../users/services/user-session.service';

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
        console.log('proceed');
        await this.getNewPromotionConfigs();
    }

    async getNewPromotionConfigs() {
        const data = await this.promotionConfigService.getNewPromotions();
        console.log(data);
    }

    insertToPromotionRunAndMarkStatusRunning() {}

    getPromotionRuns() {}

    manipulateDataForRunningPromotion() {
        // use promotionConfigs from promotionRun
    }

    updatePromotionStatusSettled() {}
}
