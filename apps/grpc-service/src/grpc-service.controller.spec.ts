import { Test, TestingModule } from '@nestjs/testing';
import { GrpcServiceController } from './grpc-service.controller';
import { GrpcServiceService } from './grpc-service.service';

describe('GrpcServiceController', () => {
  let grpcServiceController: GrpcServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GrpcServiceController],
      providers: [GrpcServiceService],
    }).compile();

    grpcServiceController = app.get<GrpcServiceController>(
      GrpcServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(grpcServiceController.getHello()).toBe('Hello World!');
    });
  });
});
