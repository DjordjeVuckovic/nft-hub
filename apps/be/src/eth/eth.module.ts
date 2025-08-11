import { Module } from '@nestjs/common';
import { EthService } from './eth.service';
import { EthListener } from "./eth.listener";

@Module({
  providers: [EthService, EthListener],
  exports: [EthService]
})
export class EthModule {}
