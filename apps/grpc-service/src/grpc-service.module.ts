import { Module } from '@nestjs/common';
import { GrpcServiceController } from './grpc-service.controller';


@Module({
  imports: [],
  controllers: [GrpcServiceController],
  providers: [],
})
export class GrpcServiceModule {}
