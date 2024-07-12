import { ApiProperty } from '@nestjs/swagger';
import { Result } from '../../../_shared/common/models/result';
import { ExchangeRates } from '../schemas';

export class ExchangeRateResponse extends Result<PromotiExchangeRatesonBets[]> {
    @ApiProperty({ type: [ExchangeRates] })
    data: ExchangeRates[];
}
