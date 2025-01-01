import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ArrayContains, Repository } from 'typeorm';
import { Mod } from '@app/db/entity/Mod';
import { InjectRepository } from '@nestjs/typeorm';
import { ModDTO } from '@dto/ModDTO';
import { ErrorCode } from '@app/types/ErrorCode.enum';
import { ModTags } from '@app/types/mod-tags.enum';
import { CreateModDTO } from '@dto/CreateModDTO';
import { SnowflakeService } from '@app/snowflake';
import { UsersService } from '../users/users.service';
import { ModifyModDTO } from '@dto/ModifyModDTO';
import { DiscordService } from '../discord/discord.service';
import { FindResultDTO } from '@dto/FindResultDTO';

@Injectable()
export class ModsService {
  private readonly logger = new Logger(ModsService.name);

  constructor(
    @InjectRepository(Mod)
    private readonly mods: Repository<Mod>,
    private readonly snowflake: SnowflakeService,
    private readonly users: UsersService,
    private readonly discord: DiscordService,
  ) {}

  async findOne(id: string): Promise<ModDTO> {
    const data = await this.mods.findOne({
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

  async findAll(tags: ModTags[], page: number, limit: number): Promise<FindResultDTO> {
    const data = await this.mods.find({
      where: {
        tags: ArrayContains(tags ?? []),
      },
      take: limit,
      skip: (page-1) * limit,
      relations: [ 'author' ],
      order: {
        lastUpdate: 'DESC',
      }
    });

    const count = await this.mods.count({
      where: {
        tags: ArrayContains(tags ?? []),
      },
    })

    return {
      totalPages: Math.ceil(count / limit),
      mods: data.map(mod => ({
        ...mod,
        authorId: mod.author.id,
        author: {
          id: mod.author.id,
          username: mod.author.username,
          globalName: mod.author.globalName,
          avatarHash: mod.author.avatarHash,
        }
      }))
    }
  }

  async create(data: CreateModDTO): Promise<ModDTO> {
    const mod = new Mod();
    mod.id = this.snowflake.nextStringId();
    mod.author = await this.users.getRawUser(data.authorId);
    mod.name = data.name;
    mod.shortDescription = data.shortDescription;
    mod.description = data.description;
    mod.installGuide = data.installGuide;
    mod.versions = data.versions;
    mod.tags = data.tags;
    mod.downloadLink = data.downloadLink;
    mod.additionalLinks = data.additionalLinks;
    mod.images = data.images;
    mod.lastUpdate = new Date();

    const [ channelId, messageId ] = await this.discord.createModChannel(mod, 'mods');
    if (channelId && messageId) {
      mod.discordChannelId = channelId;
      mod.discordMessageId = messageId;
    }

    await this.mods.save(mod);

    this.logger.log(`Created mod ${mod.id} by ${mod.author.username}`);

    return this.findOne(mod.id);
  }

  async modify(id: string, userId: string, data: ModifyModDTO): Promise<ModDTO> {
    const mod = await this.mods.findOne({
      where: {
        id,
      },
      relations: [ 'author' ],
    });

    if (!mod)
      throw new NotFoundException({
        code: ErrorCode.ModNotFound,
      });

    if (mod.author.id !== userId) throw new ForbiddenException({
      code: ErrorCode.ModNotOwned,
    })

    mod.name = data.name ?? mod.name;
    mod.shortDescription = data.shortDescription ?? mod.shortDescription;
    mod.description = data.description ?? mod.description;
    mod.installGuide = data.installGuide ?? mod.installGuide;
    mod.versions = data.versions ?? mod.versions;
    mod.tags = data.tags ?? mod.tags;
    mod.downloadLink = data.downloadLink ?? mod.downloadLink;
    mod.additionalLinks = data.additionalLinks ?? mod.additionalLinks;
    mod.images = data.images ?? mod.images;
    mod.lastUpdate = new Date();

    await this.mods.save(mod);

    this.logger.log(`Modified mod ${mod.id} by ${mod.author.username}`);

    void this.discord.updateModInfo(mod, 'mods');

    return this.findOne(mod.id);
  }

  async increaseDownloads(id: string) {
    const mod = await this.mods.findOne({
      where: {
        id,
      },
    });

    if (!mod)
      throw new NotFoundException({
        code: ErrorCode.ModNotFound,
      });

    mod.downloads++;

    void this.discord.updateModInfo(mod, 'mods');

    await this.mods.save(mod);

    this.logger.log(`Increased downloads for mod ${mod.id} to ${mod.downloads}`);
  }
}
