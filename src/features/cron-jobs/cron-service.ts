import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SentryLogger } from '../../_shared/common/providers';
import { PromotionProcessor } from './promotion-processor';

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
            this.logger.verbose(`Promotion job {start:  ${startTime.toISOString()} - finish: ${new Date().toISOString()}}`);
        } catch (error) {
            this.logger.error(error);
        }
    }
}
