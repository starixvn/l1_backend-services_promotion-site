import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import configuration from './config/configuration';
import { CronService } from './cron-jobs/cron-service';
import { LeaderBoardModule } from './leader-boards/leader-board.module';
import { PromotionConfigModule } from './promotion-configs/promotion-config.module';
import { PromotionBetModule } from './promotion-bets/promotion-bet.module';
import { PromotionRunModule } from './promotion-runs/promotion-run.module';

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
