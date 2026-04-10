import { NestFactory } from '@nestjs/core';
import { RestServiceModule } from './rest-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RestServiceModule);
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
