import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PromotionProcessor } from './promotion-processor';
import { SentryLogger } from '../../_shared/common/providers';

@Injectable()
export class CronService {
    constructor(
        @Inject(SentryLogger) private readonly logger: SentryLogger,
        private readonly promotionProcessor: PromotionProcessor,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    handleCron() {
        try {
            const startTime = new Date();
            this.promotionProcessor.proceed();
            this.logger.error(`Promotion job start: ${new Date().toISOString()} - finish: ${startTime.toISOString()}`);
        } catch (error) {
            this.logger.error(error);
        }
    }
}
