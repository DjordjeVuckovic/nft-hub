import { Module } from '@nestjs/common';
import { IpfsController } from './ipfs.controller';
import { IpfsService } from './ipfs.service';
import { ConfigModule } from '../config/config.module';
import { CONFIG_PROVIDER } from '../config/config.provider';
import { AppConfig } from '../config/config.types';

@Module({
	imports: [ConfigModule],
	controllers: [IpfsController],
	providers: [
		{
			provide: 'IPFS_CONFIG',
			useFactory: (config: AppConfig) => config.ipfsConfig,
			inject: [CONFIG_PROVIDER],
		},
		IpfsService,
	],
	exports: [IpfsService],
})
export class IpfsModule {}
