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
import { CronService } from './features/cron-jobs/cron-service';
import { NotificationModule } from './features/notifications/notification.module';
import { PromotionBetModule } from './features/promotion-bets/promotion-bet.module';
import { PromotionConfigModule } from './features/promotion-configs/promotion-config.module';
import { LeaderBoardModule } from './features/promotion-leader-boards/leader-board.module';
import { PromotionRunModule } from './features/promotion-runs/promotion-run.module';
import { UserSessionModule } from './features/users/user-session.module';
import { TicketSiloModule } from './features/ticket-silos/ticket-silo.module';
import { PromotionProcessor } from './features/cron-jobs/promotion-processor';
import { DomainModule } from './domain/domain.module';
import { ExchangeRateModule } from './features/exchange-rates/exchange-rate.module';
import { GameConfigModule } from './features/game-configs/game-config.module';

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
        UserSessionModule,
        TicketSiloModule,
        DomainModule,
        ExchangeRateModule,
        GameConfigModule,
        CacheModule.register(),
        ScheduleModule.forRoot(),
    ],
    controllers: [AppController],
    providers: [AppService, CronService, PromotionProcessor],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        //consumer.apply(AuthenticateMiddleware).exclude('/', 'api(.*)').forRoutes('*');
    }
}
