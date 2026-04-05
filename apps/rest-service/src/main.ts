import { NestFactory } from '@nestjs/core';
import { RestServiceModule } from './rest-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RestServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
