import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'fs/promises';
import { TemplateVariables } from '@app/message-template/types/TemplateVariables';

@Injectable()
export class MessageTemplateService implements OnModuleInit {
  private templateString: string = '';

  constructor(
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    this.templateString = await readFile(this.config.getOrThrow('MESSAGE_TEMPLATE_PATH'), 'utf-8');
  }

  renderTemplate(variables: TemplateVariables): string {
    return this.templateString.replace(/{{\s*(\w+)\s*}}/g, (_, key) => variables[key] ?? '');
  }
}
