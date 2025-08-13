import {Module} from '@nestjs/common';
import {NftsController} from './nfts.controller';
import {NftsService} from './nfts.service';
import {EthModule} from "../eth/eth.module";
import {IpfsModule} from "../ipfs/ipfs.module";


@Module({
	controllers: [NftsController],
	providers: [NftsService],
	imports: [EthModule, IpfsModule],
})
export class NftsModule {
}
