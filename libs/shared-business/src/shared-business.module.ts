import { Module } from '@nestjs/common';
import { SharedBusinessService } from './shared-business.service';

@Module({
  providers: [SharedBusinessService],
  exports: [SharedBusinessService],
})
export class SharedBusinessModule {}
