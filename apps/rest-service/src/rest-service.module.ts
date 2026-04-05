import { Module } from '@nestjs/common';
import { RestServiceController } from './rest-service.controller';

@Module({
  imports: [],
  controllers: [RestServiceController],
  providers: [],
})
export class RestServiceModule {}
