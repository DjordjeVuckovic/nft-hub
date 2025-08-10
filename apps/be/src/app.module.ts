import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IpfsModule } from './ipfs/ipfs.module';
import { ConfigProvider } from './providers/config.provider';

@Module({
  imports: [IpfsModule],
  controllers: [AppController],
  providers: [AppService, ConfigProvider],
})
export class AppModule {}
