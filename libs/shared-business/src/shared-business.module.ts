import { Module } from '@nestjs/common';
import { SharedBusinessService } from './shared-business.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [Product],
        synchronize: true,
      }),
    }),

    // TypeOrmModule.forRootAsync({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   username: 'naufal', 
    //   password: 'password_123', 
    //   database: 'microservice_db', 
    //   entities: [Product],
    //   synchronize: true, 
    // }),
    TypeOrmModule.forFeature([Product]),
  ],
  providers: [SharedBusinessService],
  exports: [SharedBusinessService],
})
export class SharedBusinessModule {}
