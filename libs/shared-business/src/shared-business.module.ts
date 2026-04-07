import { Module } from '@nestjs/common';
import { SharedBusinessService } from './shared-business.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'naufal', 
      password: 'password_123', 
      database: 'microservice_db', 
      entities: [Product],
      synchronize: true, 
    }),
    TypeOrmModule.forFeature([Product]),
  ],
  providers: [SharedBusinessService],
  exports: [SharedBusinessService],
})
export class SharedBusinessModule {}
