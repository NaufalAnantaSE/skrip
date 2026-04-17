import { GrpcMethod } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
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
      return {};
    }
    return product;
  }
}
