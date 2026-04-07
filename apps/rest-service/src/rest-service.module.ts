import { Module } from '@nestjs/common';
import { RestServiceController } from './rest-service.controller';
import { SharedBusinessModule } from '@app/shared-business';

@Module({
  imports: [SharedBusinessModule],
  controllers: [RestServiceController],
  providers: [],
})
export class RestServiceModule {}
