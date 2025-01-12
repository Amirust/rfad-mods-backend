import { Controller, Get } from '@nestjs/common';
import { PopularService } from './popular.service';

@Controller('popular')
export class PopularController {
  constructor(
    private readonly popular: PopularService,
  ) {}

  @Get()
  getPopular() {
    return this.popular.getPopular();
  }
}
