import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
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
import { PresetMod } from '@app/db/entity/PresetMod';
import { getAllPresetsTagsRu, resolvePresetTagsRu } from '@app/locale/preset-tags.ru';
import { getAllModTagsRu, resolveModTagsRu } from '@app/locale/mod-tags.ru';
import { ModTags } from '@app/types/mod-tags.enum';
import { PresetTags } from '@app/types/preset-tags.enum';

export type ModTypeString = 'mods' | 'presets';
export type ModType = Mod | PresetMod;

@Injectable()
export class DiscordService implements OnModuleInit {
  private readonly logger = new Logger(DiscordService.name);
  private readonly enabled = Boolean(
    this.config.get<string>('DISCORD_FUNCTIONAL_ENABLED'),
  );

  private readonly modForumTagsMap = new Map<string, string>();
  private readonly presetForumTagsMap = new Map<string, string>();

  constructor(
    private readonly djs: DjsService,
    private readonly config: ConfigService,
    private readonly template: MessageTemplateService,
  ) {}

  async onModuleInit() {
    await this.syncTags();
  }

  async createModChannel(
    mod: ModType,
    type: ModTypeString,
  ): Promise<[string | undefined, string | undefined]> {
    if (!this.enabled) return [ undefined, undefined ];

    const forum = (await this.djs.client.channels.fetch(
      this.config.getOrThrow<string>(`DISCORD_${type.toUpperCase()}_FORUM_ID`),
    )) as ForumChannel | undefined;

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
          downloads: mod.downloads ?? 0,
          installGuide: mod.installGuide,
          lastUpdate: mod.lastUpdate,
          lastUpdateSerialized: mod.lastUpdate.toLocaleDateString('ru'),
          author: mod.author.globalName,
        }),
        components: [ await this.createButtons(mod, type) ],
        files: mod.images.map((image) => ({
          attachment: image.url,
          name: image.url.split('/').at(-1),
        })),
      },
    });

    const message = (await channel.messages.fetch()).first()!;

    void message.pin();

    await channel.setAppliedTags(type === 'mods' ?
      resolveModTagsRu(mod.tags as ModTags[], false).map((e) => this.modForumTagsMap.get(e)!) :
      resolvePresetTagsRu(mod.tags as PresetTags[], false).map((e) => this.presetForumTagsMap.get(e)!)
    );

    this.logger.log(
      `Created channel ${channel.id} for mod (${type}) ${mod.id}`,
    );

    return [ channel.id, message.id ];
  }

  async updateModInfo(mod: ModType, type: ModTypeString) {
    if (!this.enabled || !mod.discordChannelId || !mod.discordMessageId) return;

    const channel = await this.getModChannel(mod.discordChannelId);
    const message = await this.getModMessage(channel.id, mod.discordMessageId);

    channel.name = mod.name;
    message.content = this.template.renderTemplate({
      title: mod.name,
      description: mod.description,
      downloads: mod.downloads ?? 0,
      installGuide: mod.installGuide,
      lastUpdate: mod.lastUpdate,
      lastUpdateSerialized: mod.lastUpdate.toLocaleDateString('ru'),
      author: mod.author.globalName,
    });

    const row = await this.createButtons(mod, type);

    await channel.edit({
      name: mod.name,
    });

    await message.edit({
      content: message.content,
      components: [ row ],
    });

    await channel.setAppliedTags(type === 'mods' ?
      resolveModTagsRu(mod.tags as ModTags[], false).map((e) => this.modForumTagsMap.get(e)!) :
      resolvePresetTagsRu(mod.tags as PresetTags[], false).map((e) => this.presetForumTagsMap.get(e)!)
    );

    this.logger.log(`Updated info for mod (${type}) ${mod.id}`);
  }

  async deleteModChannel(mod: ModType, type: ModTypeString) {
    if (!this.enabled || !mod.discordChannelId) return;

    const channel = await this.getModChannel(mod.discordChannelId);
    await channel.delete();

    this.logger.log(
      `Deleted channel ${channel.id} for mod (${type}) ${mod.id}`,
    );
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

  private async createButtons(
    mod: ModType,
    type: 'mods' | 'presets',
  ): Promise<ActionRowBuilder<ButtonBuilder>> {
    const row = new ActionRowBuilder();
    const downloadButton = new ButtonBuilder()
      .setURL(
        `${this.config.getOrThrow('APP_BASE_URL')}/${type}/${mod.id}/download`,
      )
      .setLabel('Скачать')
      .setStyle(ButtonStyle.Link);

    const additionalButtons: ButtonBuilder[] = [];
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

  private async syncTags() {
    const presetsChannel = (await this.djs.client.channels.fetch(
      this.config.getOrThrow<string>('DISCORD_PRESETS_FORUM_ID'),
    )) as ForumChannel | undefined;

    const modsChannel = (await this.djs.client.channels.fetch(
      this.config.getOrThrow<string>('DISCORD_MODS_FORUM_ID'),
    )) as ForumChannel | undefined;

    if (!presetsChannel || !modsChannel) {
      throw new NotFoundException({
        code: ErrorCode.DiscordChannelNotFound,
      });
    }

    const presetChannelNew =await presetsChannel.setAvailableTags(
      getAllPresetsTagsRu(false).map((e) => ({ name: e })),
    );
    const modsChannelNew = await modsChannel.setAvailableTags(
      getAllModTagsRu(false).map((e) => ({ name: e })),
    );

    this.modForumTagsMap.clear();
    this.presetForumTagsMap.clear();

    for (const tag of modsChannelNew.availableTags)
      this.modForumTagsMap.set(tag.name, tag.id);

    for (const tag of presetChannelNew.availableTags)
      this.presetForumTagsMap.set(tag.name, tag.id);

    this.logger.log('Synced tags');
  }
}
