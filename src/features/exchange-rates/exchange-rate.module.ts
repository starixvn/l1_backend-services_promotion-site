import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExchangeRateService } from './exchange-rate.service';
import { ExchangeRates, ExchangeRateSchema } from './schemas';

@Module({
    imports: [MongooseModule.forFeature([{ name: ExchangeRates.name, schema: ExchangeRateSchema, collection: 'exchange_rates' }])],
    providers: [ExchangeRateService],
    exports: [ExchangeRateService],
})
export class ExchangeRateModule {}
