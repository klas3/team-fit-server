import { Module } from '@nestjs/common';
import AppGateway from './app.gateway';

@Module({
  providers: [AppGateway],
  exports: [AppGateway],
})
class GatewayModule {}

export default GatewayModule;
