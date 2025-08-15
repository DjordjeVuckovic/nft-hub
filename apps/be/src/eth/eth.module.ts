import { Module } from '@nestjs/common';
import { EthService } from './eth.service';
import {EthEventListener} from "./eth-event.listener";

@Module({
  providers: [EthService, EthEventListener],
  exports: [EthService, EthEventListener]
})
export class EthModule {}
