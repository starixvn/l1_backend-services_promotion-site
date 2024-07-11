import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './_shared/common/common.module';
import configuration from './_shared/config/configuration';
import { CronService } from './features/cron-jobs/cron-service';
import { LeaderBoardModule } from './features/promotion-leader-boards/leader-board.module';
import { PromotionConfigModule } from './features/promotion-configs/promotion-config.module';
import { PromotionBetModule } from './features/promotion-bets/promotion-bet.module';
import { PromotionRunModule } from './features/promotion-runs/promotion-run.module';
import { NotificationModule } from './features/notifications/notification.module';

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
        CacheModule.register(),
        ScheduleModule.forRoot(),
    ],
    controllers: [AppController],
    providers: [AppService, CronService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        //consumer.apply(AuthenticateMiddleware).exclude('/', 'api(.*)').forRoutes('*');
    }
}
