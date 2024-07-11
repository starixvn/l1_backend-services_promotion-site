import { ApiProperty } from '@nestjs/swagger';
import { Result } from '../../../_shared/common/models/result';
import { TicketSilos } from '../schemas';

export class TicketSiloResponse extends Result<TicketSilos[]> {
    @ApiProperty({ type: [TicketSilos] })
    data: TicketSilos[];
}
