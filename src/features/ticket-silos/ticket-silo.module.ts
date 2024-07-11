import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketSiloService } from './ticket-silo.service';
import { TicketSilos, TicketSilosSchema } from './schemas';

@Module({
    imports: [MongooseModule.forFeature([{ name: TicketSilos.name, schema: TicketSilosSchema, collection: 'ticket_silos' }])],
    providers: [TicketSiloService],
    exports: [TicketSiloService],
})
export class TicketSiloModule {}
