import { Module, forwardRef } from '@nestjs/common';
import { EthService } from './eth.service';
import { EthContractListener } from './eth-contract.listener';
import { EventsModule } from '../events/events.module';

@Module({
	imports: [],
	providers: [EthService, EthContractListener],
	exports: [EthService, EthContractListener],
})
export class EthModule {}
