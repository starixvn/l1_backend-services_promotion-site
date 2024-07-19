import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { SentryLogger } from '../../src/_shared/common/providers';

@Injectable()
export class DecodeSessionIdMiddleware implements NestMiddleware {
    @Inject(SentryLogger) private readonly logger: SentryLogger;

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.query && req.query['sessionId']) {
                //TODO: Temp log for dev purpose
                console.log(`Request...${req.query['sessionId'].toString()}`);
                req.query['sessionId'] = Buffer.from(req.query['sessionId'].toString(), 'base64').toString();
            }
            next();
        } catch (ex) {
            this.logger.error(`DecodeSessionIdMiddleware ${ex.message}}`);
        }
    }
}
