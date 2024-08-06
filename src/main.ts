import * as dotenv from 'dotenv';
dotenv.config();

import helmet from '@fastify/helmet';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { join } from 'path';

import { SentryLogger } from './_shared/common/providers/logger.service';
import { AppModule } from './app.module';

async function bootstrap() {
    
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ caseSensitive: false }));

    app.useLogger(app.get(SentryLogger));
    app.register(helmet, { contentSecurityPolicy: false, frameguard: false });
    app.useStaticAssets({
        root: join(__dirname, '..', 'public'),
    });
    app.setViewEngine({
        engine: {
            handlebars: require('hbs'),
        },
        templates: join(__dirname, '..', 'views'),
    });
    
    app.enableCors();

    await app.init();    

    await app.listen(process.env.PORT || 3000, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
