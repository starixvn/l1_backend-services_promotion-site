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
import { CronService } from './features/cron-jobs/cron-service';
import { PromotionProcessor } from './features/cron-jobs/promotion-processor';
import { ExchangeRateModule } from './features/exchange-rates/exchange-rate.module';
import { GameConfigModule } from './features/game-configs/game-config.module';
import { NotificationModule } from './features/notifications/notification.module';
import { PromotionBetModule } from './features/promotion-bets/promotion-bet.module';
import { PromotionConfigModule } from './features/promotion-configs/promotion-config.module';
import { LeaderBoardModule } from './features/promotion-leader-boards/leader-board.module';
import { PromotionRunModule } from './features/promotion-runs/promotion-run.module';
import { UserClientServiceModule } from './features/users/user-service.module';
import { DecodeSessionIdMiddleware } from './middlewares/decode-session-id.middleware';
import { TempLogEndGameModule } from './features/end-games/temp-log-end-game.module';
import { UserInfoModule } from './features/users/user-info.module';

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
        LeaderBoardModule,
        PromotionConfigModule,
        PromotionBetModule,
        PromotionRunModule,
        NotificationModule,
        UserClientServiceModule,
        DomainModule,
        ExchangeRateModule,
        GameConfigModule,
        TempLogEndGameModule,
        UserInfoModule,
        CacheModule.register(),
        ScheduleModule.forRoot(),
    ],
    controllers: [AppController],
    providers: [AppService, CronService, PromotionProcessor],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(DecodeSessionIdMiddleware).forRoutes('*');
    }
}
