import {Module} from '@nestjs/common';
import {NftsController} from './nfts.controller';
import {NftsService} from './nfts.service';
import {EthModule} from "../eth/eth.module";


@Module({
	controllers: [NftsController],
	providers: [NftsService],
	imports: [EthModule],
})
export class NftsModule {
}
