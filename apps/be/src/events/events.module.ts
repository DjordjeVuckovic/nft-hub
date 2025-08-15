import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsListener } from './events.listener';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { ContractEvent, ContractEventSchema } from './events.domain';
import { EventsService } from './events.service';
import { EthModule } from '../eth/eth.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: ContractEvent.name, schema: ContractEventSchema }]), EthModule],
	providers: [EventsListener, EventsRepository, EventsService],
	controllers: [EventsController],
	exports: [EventsListener, EventsRepository],
})
export class EventsModule {}
