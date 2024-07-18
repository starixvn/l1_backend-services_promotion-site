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

    @Cron(process.env.PROMOTION_CRON_JOB, { disabled: process.env.DISABLE_PROMOTION_CRON_JOB === 'true' })
    handleCron() {
        try {
            const startTime = new Date();
            this.promotionProcessor.proceed();
            this.logger.warn(`Promotion job {start:  ${startTime.toISOString()} - finish: ${new Date().toISOString()}}`);
        } catch (error) {
            this.logger.error(error);
        }
    }
}
