import { Module } from '@nestjs/common';
import { RestServiceController } from './rest-service.controller';
import { SharedBusinessModule } from '../../../libs/shared-business/src';

@Module({
  imports: [SharedBusinessModule],
  controllers: [RestServiceController],
  providers: [],
})
export class RestServiceModule {}
