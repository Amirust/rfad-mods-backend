import { Test, TestingModule } from '@nestjs/testing';
import { SnowflakeService } from './snowflake.service';

describe('SnowflakeService', () => {
  let service: SnowflakeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ SnowflakeService ],
    }).compile();

    service = module.get<SnowflakeService>(SnowflakeService);
  });

  it('should generate ID', () => {
    expect(service.nextStringId()).toBeDefined();
  });
});
