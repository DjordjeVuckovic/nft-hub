import { Module, forwardRef } from '@nestjs/common';
import { EthService } from './eth.service';
import {EthEventListener} from "./eth-event.listener";
import { EventsModule } from '../events/events.module';

@Module({
  imports: [forwardRef(() => EventsModule)],
  providers: [EthService, EthEventListener],
  exports: [EthService, EthEventListener]
})
export class EthModule {}
