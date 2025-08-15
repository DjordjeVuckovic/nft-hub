import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EthEventListener } from '../eth/eth-event.listener';

@Module({
  providers: [
    EventsService,
		EthEventListener
  ],
  controllers: [EventsController],
  exports: [EventsService]
})
export class EventsModule {}
