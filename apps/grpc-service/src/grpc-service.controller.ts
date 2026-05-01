import { GrpcMethod } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import { SharedBusinessService } from '../../../libs/shared-business/src';

@Controller()
export class GrpcServiceController {
  constructor(private readonly sharedBusinessService: SharedBusinessService) {}

  @GrpcMethod('ProductService', 'GetProduct')
  async getProduct(payload: { payloadType: string }) {
    const product = await this.sharedBusinessService.getProductByPayloadType(
      payload.payloadType,
    );
    if (!product) {
      throw {
        code: status.NOT_FOUND,
        message: `Product with payload type ${payload.payloadType} not found`,
      };
    }
    return product;
  }
}
