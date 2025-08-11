import { Global, Module } from '@nestjs/common';
import { ConfigProvider } from './config.provider';

@Global()
@Module({
  providers: [ConfigProvider],
  exports: [ConfigProvider],
})
export class ConfigModule {}