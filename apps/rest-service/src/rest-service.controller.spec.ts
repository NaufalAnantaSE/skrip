import { Test, TestingModule } from '@nestjs/testing';
import { RestServiceController } from './rest-service.controller';
import { RestServiceService } from './rest-service.service';

describe('RestServiceController', () => {
  let restServiceController: RestServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RestServiceController],
      providers: [RestServiceService],
    }).compile();

    restServiceController = app.get<RestServiceController>(RestServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(restServiceController.getHello()).toBe('Hello World!');
    });
  });
});
