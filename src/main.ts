import { initializer, initSpanProcessor, addIdentifiers } from 'sc-instrument';
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import { join } from 'path';

import { AppModule } from './app.module';
import { SentryLogger } from './_shared/common/providers/logger.service';

async function bootstrap() {
    if (process.env.ENABLE_OTEL) {
        initSpanProcessor(process.env.OTEL_EXPORTER ?? '', initializer);
        addIdentifiers(`${process.env.SYSTEM_TYPE} - ${process.env.APP_NAME}`, process.env.ENV ?? '', initializer);
        initializer.start();
    }

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

    await app.init();
    const config = new DocumentBuilder()
        .addBearerAuth()
        .setTitle('Promotion Site')
        .setDescription('The Promotion Site Description')
        .setVersion('1.0')
        .addTag('promotion-site')
        .build();

    if (process.env.NODE_ENV !== 'PROD') {
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api', app, document);
    }

    await app.listen(process.env.PORT || 3000, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
