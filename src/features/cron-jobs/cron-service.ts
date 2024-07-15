import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
//import { SentryLogger } from 'src/_shared/common/providers';
import { PromotionConfigService } from '../promotion-configs/promotion-config.service';
import { TicketSiloService } from '../ticket-silos/ticket-silo.service';
//import { UserSessionsService } from '../users/services/user-session.service';
import { PromotionBetService } from '../promotion-bets/promotion-bet.service';
import { LeaderBoardService } from '../promotion-leader-boards/leader-board.service';
import { PromotionRunService } from '../promotion-runs/promotion-run.service';
import { PromotionProcessor } from './promotion-processor';
import { SentryLogger } from '../../_shared/common/providers';

@Injectable()
export class CronService {
    constructor(
        @Inject(SentryLogger) private readonly logger: SentryLogger,
        private readonly promotionProcessor: PromotionProcessor,
    ) {}

    @Cron(CronExpression.EVERY_10_SECONDS)
    handleCron() {
        try {
            //this.promotionProcessor.proceed();
            // log to sentry every run
        } catch (error) {
            //this.logger.error(error);
        }
    }
}
