import { GrpcMethod } from '@nestjs/microservices';
import { SharedBusinessService } from './../../../libs/shared-business/src/shared-business.service';
import { Controller } from '@nestjs/common';


@Controller()
export class GrpcServiceController {
  constructor(private readonly sharedBusinessService: SharedBusinessService) {}

  @GrpcMethod('ProductService', 'GetProduct')
  async getProduct(payload: { payloadType: string }) {
    const product = await this.sharedBusinessService.getProductByPayloadType(payload.payloadType);
    if (!product) {
      return {}
    }
    return product
  }


}
