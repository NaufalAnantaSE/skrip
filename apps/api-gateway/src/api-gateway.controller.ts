import { HttpService } from '@nestjs/axios';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  OnModuleInit,
  Param,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { AxiosError } from 'axios';
import { Observable, firstValueFrom } from 'rxjs';

interface ProductRequest {
  payloadType: string;
}

interface ProductResponse {
  id: number;
  name: string;
  price: string;
  payloadType: string;
  description: string;
}

interface ProductService {
  getProduct?: (payload: ProductRequest) => Observable<ProductResponse>;
  GetProduct?: (payload: ProductRequest) => Observable<ProductResponse>;
}

@Controller('benchmark')
export class ApiGatewayController implements OnModuleInit {
  private productService!: ProductService;

  constructor(
    private readonly httpService: HttpService,
    @Inject('PRODUCT_PACKAGE') private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.productService =
      this.grpcClient.getService<ProductService>('ProductService');
  }

  @Get('rest/:payloadType')
  async benchmarkRest(@Param('payloadType') payloadType: string) {
    const upstreamHost = process.env.REST_SERVICE_URL || 'http://127.0.0.1:3000';
    const upstreamUrl = `${upstreamHost}/products/${encodeURIComponent(payloadType)}`;

    try {
      const response = await firstValueFrom(this.httpService.get(upstreamUrl));
      return response.data;
    } catch (error) {
      throw this.mapRestError(error);
    }
  }

  @Get('grpc/:payloadType')
  async benchmarkGrpc(@Param('payloadType') payloadType: string) {
    const grpcMethod =
      this.productService.getProduct ?? this.productService.GetProduct;

    if (!grpcMethod) {
      throw new ServiceUnavailableException(
        'GetProduct method is not available on gRPC client',
      );
    }

    try {
      return await firstValueFrom(grpcMethod({ payloadType }));
    } catch (error) {
      throw this.mapGrpcError(error);
    }
  }

  private mapRestError(error: unknown): HttpException {
    if (error instanceof AxiosError && error.response) {
      return new HttpException(error.response.data, error.response.status);
    }

    return new HttpException(
      'REST upstream service is unavailable',
      HttpStatus.BAD_GATEWAY,
    );
  }

  private mapGrpcError(error: unknown): HttpException {
    if (typeof error === 'object' && error && 'details' in error) {
      return new HttpException(
        String((error as { details?: string }).details || 'gRPC call failed'),
        HttpStatus.BAD_GATEWAY,
      );
    }

    return new HttpException(
      'gRPC upstream service is unavailable',
      HttpStatus.BAD_GATEWAY,
    );
  }
}
