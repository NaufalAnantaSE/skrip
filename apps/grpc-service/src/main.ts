import { NestFactory } from '@nestjs/core';
import { GrpcServiceModule } from './grpc-service.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(GrpcServiceModule, {
    transport: Transport.GRPC,
    options: {
      package: 'product',
      protoPath: join(__dirname, 'product.proto'),
      url: '0.0.0.0:5000',
    },
  });
  await app.listen();
  console.log('gRPC microservice is listening on 0.0.0.0:5000');
}
bootstrap();
