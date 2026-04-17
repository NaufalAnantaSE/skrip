import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { SharedBusinessService } from '../../../libs/shared-business/src';

@Controller('products')
export class RestServiceController {
  constructor(
    private readonly sharedBusinessService: SharedBusinessService,
  ) {}

  @Get(':payloadType')
  async getProducts(@Param('payloadType') payloadType: string) {
    const product =
      await this.sharedBusinessService.getProductByPayloadType(payloadType);
    if (!product) {
      throw new NotFoundException(
        `Produk dengan payload type ${payloadType} tidak ditemukan`,
      );
    }
    return product;
  }
}
