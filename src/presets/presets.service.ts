import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ArrayContains, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorCode } from '@app/types/ErrorCode.enum';
import { SnowflakeService } from '@app/snowflake';
import { UsersService } from '../users/users.service';
import { DiscordService } from '../discord/discord.service';
import { PresetMod } from '@app/db/entity/PresetMod';
import { PresetDTO } from '@dto/PresetDTO';
import { CreatePresetDTO } from '@dto/CreatePresetDTO';
import { FindPresetsResultDTO } from '@dto/FindPresetsResultDTO';
import { ModifyPresetDTO } from '@dto/ModifyPresetDTO';
import { PresetTags } from '@app/types/preset-tags.enum';

@Injectable()
export class PresetsService {
  private readonly logger = new Logger(PresetsService.name);

  constructor(
    @InjectRepository(PresetMod)
    private readonly presets: Repository<PresetMod>,
    private readonly snowflake: SnowflakeService,
    private readonly users: UsersService,
    private readonly discord: DiscordService,
  ) {}

  async findOne(id: string): Promise<PresetDTO> {
    const data = await this.presets.findOne({
      where: {
        id,
      },
      relations: [ 'author' ],
    });

    if (!data)
      throw new NotFoundException({
        code: ErrorCode.ModNotFound,
      });

    return {
      ...data,
      authorId: data.author.id,
      author: {
        id: data.author.id,
        username: data.author.username,
        globalName: data.author.globalName,
        avatarHash: data.author.avatarHash,
      },
    }
  }

  async findAll(tags: PresetTags[], page: number, limit: number): Promise<FindPresetsResultDTO> {
    const data = await this.presets.find({
      where: {
        tags: ArrayContains(tags ?? []),
      },
      take: limit,
      skip: (page - 1) * limit,
      relations: [ 'author' ],
      order: {
        lastUpdate: 'DESC',
      },
    });

    const count = await this.presets.count({
      where: {
        tags: ArrayContains(tags ?? []),
      },
    });

    return {
      totalPages: Math.ceil(count / limit),
      mods: data.map((mod) => ({
        ...mod,
        authorId: mod.author.id,
        author: {
          id: mod.author.id,
          username: mod.author.username,
          globalName: mod.author.globalName,
          avatarHash: mod.author.avatarHash,
        },
      })),
    };
  }

  async create(data: CreatePresetDTO): Promise<PresetDTO> {
    const preset = new PresetMod();
    preset.id = this.snowflake.nextStringId();
    preset.author = await this.users.getRawUser(data.authorId);
    preset.name = data.name;
    preset.shortDescription = data.shortDescription;
    preset.description = data.description;
    preset.installGuide = data.installGuide;
    preset.tags = data.tags;
    preset.downloadLink = data.downloadLink;
    preset.additionalLinks = data.additionalLinks;
    preset.images = data.images;
    preset.lastUpdate = new Date();

    const [ channelId, messageId ] = await this.discord.createModChannel(preset, 'presets');
    if (channelId && messageId) {
      preset.discordChannelId = channelId;
      preset.discordMessageId = messageId;
    }

    await this.presets.save(preset);

    this.logger.log(`Created preset ${preset.id} by ${preset.author.username}`);

    return this.findOne(preset.id);
  }

  async modify(id: string, userId: string, data: ModifyPresetDTO): Promise<PresetDTO> {
    const preset = await this.presets.findOne({
      where: {
        id,
      },
      relations: [ 'author' ],
    });

    if (!preset)
      throw new NotFoundException({
        code: ErrorCode.ModNotFound,
      });

    if (preset.author.id !== userId) throw new ForbiddenException({
      code: ErrorCode.ModNotOwned,
    })

    preset.name = data.name ?? preset.name;
    preset.shortDescription = data.shortDescription ?? preset.shortDescription;
    preset.description = data.description ?? preset.description;
    preset.installGuide = data.installGuide ?? preset.installGuide;
    preset.tags = data.tags ?? preset.tags;
    preset.downloadLink = data.downloadLink ?? preset.downloadLink;
    preset.additionalLinks = data.additionalLinks ?? preset.additionalLinks;
    preset.images = data.images ?? preset.images;
    preset.lastUpdate = new Date();

    await this.presets.save(preset);

    this.logger.log(`Modified preset ${preset.id} by ${preset.author.username}`);

    void this.discord.updateModInfo(preset, 'presets');

    return this.findOne(preset.id);
  }

  async increaseDownloads(id: string) {
    const preset = await this.presets.findOne({
      where: {
        id,
      },
    });

    if (!preset)
      throw new NotFoundException({
        code: ErrorCode.ModNotFound,
      });

    preset.downloads++;

    void this.discord.updateModInfo(preset, 'presets');

    await this.presets.save(preset);

    this.logger.log(`Increased downloads for preset ${preset.id} to ${preset.downloads}`);
  }
}
