import { SharedBusinessService } from './../../../libs/shared-business/src/shared-business.service';
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';

@Controller('products')
export class RestServiceController {
  constructor(private readonly SharedBusinessService: SharedBusinessService) {}

  @Get(':payloadType')
  async getProducts(@Param('payloadType') payloadType: string) {
    const product = await this.SharedBusinessService.getProductByPayloadType(payloadType);
    if (!product) {
      throw new NotFoundException(`Produk dengan payload type ${payloadType} tidak ditemukan`);
    }
    return product;
  }
}