import { Module } from '@nestjs/common';
import { GrpcServiceController } from './grpc-service.controller';
import { SharedBusinessModule } from '../../../libs/shared-business/src';

@Module({
  imports: [SharedBusinessModule],
  controllers: [GrpcServiceController],
  providers: [],
})
export class GrpcServiceModule {}
