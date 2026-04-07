import { Module } from '@nestjs/common';
import { GrpcServiceController } from './grpc-service.controller';
import { SharedBusinessModule } from '@app/shared-business';


@Module({
  imports: [SharedBusinessModule],
  controllers: [GrpcServiceController],
  providers: [],
})
export class GrpcServiceModule {}
