import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { join } from 'path';
import { ApiGatewayController } from './api-gateway.controller';

const keepAliveHttpAgent = new HttpAgent({
  keepAlive: true,
  keepAliveMsecs: 60_000,
  maxSockets: 2048,
  maxFreeSockets: 512,
});

const keepAliveHttpsAgent = new HttpsAgent({
  keepAlive: true,
  keepAliveMsecs: 60_000,
  maxSockets: 2048,
  maxFreeSockets: 512,
});

@Module({
  imports: [
    HttpModule.register({
      timeout: 30_000,
      maxRedirects: 0,
      httpAgent: keepAliveHttpAgent,
      httpsAgent: keepAliveHttpsAgent,
    }),
    ClientsModule.register([
      {
        name: 'PRODUCT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'product',
          protoPath: join(__dirname, 'product.proto'),
          url: 'grpc_service_container:5000',
          channelOptions: {
            'grpc.keepalive_time_ms': 30_000,
            'grpc.keepalive_timeout_ms': 10_000,
            'grpc.keepalive_permit_without_calls': 1,
            'grpc.http2.max_pings_without_data': 0,
          },
        },
      },
    ]),
  ],
  controllers: [ApiGatewayController],
})
export class ApiGatewayModule {}
