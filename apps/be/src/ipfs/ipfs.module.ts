import { Module } from '@nestjs/common';
import { IpfsController } from './ipfs.controller';
import { IpfsService } from './ipfs.service';
import { ConfigProvider } from '../providers/config.provider';

@Module({
  controllers: [IpfsController],
  providers: [IpfsService, ConfigProvider]
})
export class IpfsModule {}
