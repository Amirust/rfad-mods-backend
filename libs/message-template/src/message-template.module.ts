import { Module } from '@nestjs/common';
import { MessageTemplateService } from './message-template.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ ConfigModule ],
  providers: [ MessageTemplateService ],
  exports: [ MessageTemplateService ],
})
export class MessageTemplateModule {}
