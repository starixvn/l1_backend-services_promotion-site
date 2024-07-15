import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class DecodeSessionIdMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.query && req.query['sessionId']) {
                console.log(`Request...${req.query['sessionId'].toString()}`);
                req.query['sessionId'] = Buffer.from(req.query['sessionId'].toString(), 'base64').toString();
            }
            next();
        } catch (ex) {}
    }
}
