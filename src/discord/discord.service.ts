import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DjsService } from '@app/djs';
import { Mod } from '@app/db/entity/Mod';
import { ConfigService } from '@nestjs/config';
import { ErrorCode } from '@app/types/ErrorCode.enum';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle, ForumChannel,
  ThreadChannel
} from 'discord.js';
import { MessageTemplateService } from '@app/message-template';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  private readonly enabled = Boolean(
    this.config.get<string>('DISCORD_FUNCTIONAL_ENABLED'),
  );

  constructor(
    private readonly djs: DjsService,
    private readonly config: ConfigService,
    private readonly template: MessageTemplateService,
  ) {}

  async createModChannel(mod: Mod): Promise<[string | undefined, string | undefined]> {
    if (!this.enabled) return [ undefined, undefined ];

    const forum = await this.djs.client.channels.fetch(
      this.config.getOrThrow<string>('DISCORD_MODS_FORUM_ID'),
    ) as ForumChannel | undefined;

    if (!forum) {
      throw new NotFoundException({
        code: ErrorCode.DiscordChannelNotFound,
      });
    }

    const channel = await forum.threads.create({
      name: mod.name,
      autoArchiveDuration: 60,
      message: {
        content: this.template.renderTemplate({
          title: mod.name,
          description: mod.description,
          downloads: mod.downloads,
          lastUpdate: mod.lastUpdate,
          lastUpdateSerialized: mod.lastUpdate.toLocaleDateString('ru'),
        }),
        components: [ await this.createButtons(mod) ],
      }
    });

    const message = (await channel.messages.fetch()).first()!;

    this.logger.log(`Created channel ${channel.id} for mod ${mod.id}`);

    return [ channel.id, message.id ];
  }

  async updateModInfo(mod: Mod) {
    if (!this.enabled || !mod.discordChannelId || !mod.discordMessageId) return;

    const channel = await this.getModChannel(mod.discordChannelId);
    const message = await this.getModMessage(channel.id, mod.discordMessageId);

    channel.name = mod.name;
    message.content = this.template.renderTemplate({
      title: mod.name,
      description: mod.description,
      downloads: mod.downloads,
      lastUpdate: mod.lastUpdate,
      lastUpdateSerialized: mod.lastUpdate.toLocaleDateString('ru'),
    });

    const row = await this.createButtons(mod);

    await channel.edit({
      name: mod.name,
    })

    await message.edit({
      content: message.content,
      components: [ row ],
    })

    this.logger.log(`Updated info for mod ${mod.id}`);
  }

  private async getModChannel(id: string): Promise<ThreadChannel> {
    const channel = await this.djs.client.channels.fetch(id);

    if (!channel) {
      throw new NotFoundException({
        code: ErrorCode.DiscordChannelNotFound,
      });
    }

    return channel as ThreadChannel;
  }

  private async getModMessage(channelId: string, id: string) {
    const channel = await this.getModChannel(channelId);
    return channel.messages.fetch(id);
  }

  private async createButtons(mod: Mod): Promise<ActionRowBuilder<ButtonBuilder>> {
    const row = new ActionRowBuilder();
    const downloadButton = new ButtonBuilder()
      .setURL(`${this.config.getOrThrow('APP_BASE_URL')}/mods/${mod.id}/download`)
      .setLabel('Скачать')
      .setStyle(ButtonStyle.Link);

    const additionalButtons: ButtonBuilder[] = []
    for (const button of mod.additionalLinks) {
      additionalButtons.push(
        new ButtonBuilder()
          .setURL(button.url)
          .setLabel(button.name)
          .setStyle(ButtonStyle.Link),
      );
    }

    row.addComponents(downloadButton, ...additionalButtons);
    return row as ActionRowBuilder<ButtonBuilder>;
  }
}
