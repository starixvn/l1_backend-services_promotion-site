import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DomainService } from './domain.service';
import { Domain, DomainSchema } from './schemas/domain.schema';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [CacheModule.register(), MongooseModule.forFeature([{ name: Domain.name, schema: DomainSchema }])],
    providers: [DomainService],
    exports: [DomainService],
})
export class DomainModule {}
