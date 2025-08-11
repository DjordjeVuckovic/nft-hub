import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IpfsModule } from './ipfs/ipfs.module';
import { ConfigModule } from './config/config.module';
import { EventsModule } from './events/events.module';
import { NftsModule } from './nfts/nfts.module';
import { EthModule } from './eth/eth.module';
import {CacheModule} from "@nestjs/cache-manager";

@Module({
  imports: [
	  ConfigModule,
	  IpfsModule,
	  EventsModule,
	  NftsModule,
	  EthModule,
	  CacheModule.register({
		  ttl: 5 * 60,
		  max: 1000,
		  isGlobal: true,
		  store: 'memory'
	  })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
