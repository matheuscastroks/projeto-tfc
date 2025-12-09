import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            check: jest.fn().mockReturnValue({
              status: 'ok',
              environment: 'test',
            }),
            checkDatabase: jest.fn().mockResolvedValue({
              status: 'ok',
              database: 'connected',
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status', () => {
      const result = controller.check();
      expect(result).toEqual({
        status: 'ok',
        environment: 'test',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.check).toHaveBeenCalled();
    });
  });

  describe('checkDatabase', () => {
    it('should return database health status', async () => {
      const result = await controller.checkDatabase();
      expect(result).toEqual({
        status: 'ok',
        database: 'connected',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.checkDatabase).toHaveBeenCalled();
    });
  });
});
