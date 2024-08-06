import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonModule } from './_shared/common/common.module';
import configuration from './_shared/config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DomainModule } from './domain/domain.module';
import { DecodeSessionIdMiddleware } from './middlewares/decode-session-id.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                ...configService.get('database'),
            }),
            inject: [ConfigService],
        }),
        JwtModule.register({}),
        CommonModule,
        DomainModule,        
        CacheModule.register(),
        ScheduleModule.forRoot(),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(DecodeSessionIdMiddleware).forRoutes('*');
    }
}
