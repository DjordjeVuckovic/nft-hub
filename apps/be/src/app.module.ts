import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { IpfsModule } from './ipfs/ipfs.module';
import { ConfigModule } from './config/config.module';
import { EventsModule } from './events/events.module';
import { NftsModule } from './nfts/nfts.module';
import { EthModule } from './eth/eth.module';
import {CacheModule} from "@nestjs/cache-manager";

@Module({
  imports: [
	  ConfigModule,
	  MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/ntf_db'),
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
})
export class AppModule {}
