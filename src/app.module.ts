import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseModule } from '@app/response';

@Module({
  imports: [
    ResponseModule
  ],
  controllers: [ AppController ],
  providers: [ AppService ],
})
export class AppModule {}