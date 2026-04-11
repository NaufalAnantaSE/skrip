import { Injectable } from '@nestjs/common';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Injectable()
export class SharedBusinessService implements OnModuleInit {
  private readonly logger = new Logger(SharedBusinessService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async onModuleInit() {
    await this.seedData();
  }

  async getProductByPayloadType(payloadType: string): Promise<Product | null> {
    return this.productRepository.findOne({ where: { payloadType } });
  }

  private async seedData() {
    this.logger.log('Memeriksa ketersediaan data eksperimen...');
    
    const payloads = [
      { type: '1KB', size: 1 },
      { type: '10KB', size: 10 },
      { type: '100KB', size: 100 },
      { type: '1MB', size: 1024 }, 
    ];

    for (const p of payloads) {
      const exists = await this.productRepository.findOne({ where: { payloadType: p.type } });
      
      if (!exists) {
        this.logger.log(`Payload ${p.type} belum ada. Membangun data...`);
        const description = this.generateExactPayload(p.size);
        const product = this.productRepository.create({
          name: `Produk Uji ${p.type}`,
          price: 10000,
          payloadType: p.type,
          description: description,
        });
        await this.productRepository.save(product);
        this.logger.log(`Berhasil injeksi payload ${p.type}`);
      } else {
        this.logger.log(`Payload ${p.type} sudah tersedia. Skip.`);
      }
    }
  }

  private generateExactPayload(kbSize: number): string {
    const bytesNeeded = kbSize * 1024;
    const baseString = 'PayloadData-';
    const repeatCount = Math.floor(bytesNeeded / baseString.length);
    const remainder = bytesNeeded % baseString.length;
    return baseString.repeat(repeatCount) + baseString.substring(0, remainder);
  }
}
