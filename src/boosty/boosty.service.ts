import { ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ArrayContains, Repository } from 'typeorm';
import { BoostyMod } from '@app/db/entity/BoostyMod';
import { InjectRepository } from '@nestjs/typeorm';
import { ModTags } from '@app/types/mod-tags.enum';
import { BoostyFindResultDTO } from '@dto/BoostyFindResultDTO';
import { ErrorCode } from '@app/types/ErrorCode.enum';
import { BoostyModDTO } from '@dto/BoostyModDTO';
import { UsersService } from '../users/users.service';
import { CacheService } from '../cache/cache.service';
import { CreateBoostyModDTO } from '@dto/CreateBoostyModDTO';
import { SnowflakeService } from '@app/snowflake';
import { ModifyBoostyModDTO } from '@dto/ModifyBoostyModDTO';

@Injectable()
export class BoostyService {
  private readonly logger = new Logger(BoostyService.name);

  constructor(
    @InjectRepository(BoostyMod)
    private readonly bmods: Repository<BoostyMod>,
    private readonly users: UsersService,
    private readonly cache: CacheService,
    private readonly snowflake: SnowflakeService,
  ) {}

  async findOne(id: string): Promise<BoostyModDTO> {
    const data = await this.bmods.findOne({
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
      accessible: true,
      author: {
        id: data.author.id,
        username: data.author.username,
        globalName: data.author.globalName,
        avatarHash: data.author.avatarHash,
      },
    }
  }

  async findAll(tags: ModTags[], page: number, limit: number, userId: string): Promise<BoostyFindResultDTO> {
    const data = await this.bmods.find({
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

    const count = await this.bmods.count({
      where: {
        tags: ArrayContains(tags ?? []),
      },
    })

    let modAccessible: Map<string, boolean> = this.cache.get(`mods-accessible-${userId}`)
    if (!modAccessible) {
      const array = await this.users.checkBoostyPermissionBulk(userId, data.map(mod => mod.requiredTier))
      modAccessible = new Map(array.map((value, index) => [ data[index].id, value ]))

      this.cache.set(`mods-accessible-${userId}`, modAccessible)
    }

    return {
      totalPages: Math.ceil(count / limit),
      mods: data.map(mod => ({
        ...mod,
        downloadLink: undefined, // Hide download link
        additionalLinks: undefined,
        accessible: modAccessible.get(mod.id) ?? false,
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

  async increaseDownloads(id: string, userId: string) {
    const mod = await this.bmods.findOne({
      where: {
        id,
      },
    });

    if (!mod)
      throw new NotFoundException({
        code: ErrorCode.ModNotFound,
      });

    mod.downloads++;

    await this.bmods.save(mod);

    this.logger.log(`Increased downloads for boosty mod ${mod.id} to ${mod.downloads}. User ${userId}`);

    return mod.downloadLink;
  }

  async create(data: CreateBoostyModDTO): Promise<BoostyModDTO> {
    if (!data.authorId) throw new UnauthorizedException({
      code: ErrorCode.TokenInvalid
    })

    if (!(await this.users.checkModeratorPermission(data.authorId))) throw new ForbiddenException({
      code: ErrorCode.NoModeratorPermission,
    })

    const mod = new BoostyMod();
    mod.id = this.snowflake.nextStringId();
    mod.author = await this.users.getRawUser(data.authorId);
    mod.name = data.name;
    mod.shortDescription = data.shortDescription;
    mod.description = data.description;
    mod.installGuide = data.installGuide;
    mod.tags = data.tags;
    mod.downloadLink = data.downloadLink;
    mod.additionalLinks = data.additionalLinks;
    mod.images = data.images;
    mod.requiredTier = data.requiredTier;
    mod.lastUpdate = new Date();

    await this.bmods.save(mod);

    this.logger.log(`Created boosty mod ${mod.id} by ${mod.author.username}`);

    return this.findOne(mod.id);
  }

  async modify(id: string, userId: string, data: ModifyBoostyModDTO): Promise<BoostyModDTO> {
    const mod = await this.bmods.findOne({
      where: {
        id,
      },
      relations: [ 'author' ],
    });

    if (!mod)
      throw new NotFoundException({
        code: ErrorCode.ModNotFound,
      });

    if (mod.author.id !== userId && !(await this.users.checkModeratorPermission(userId))) throw new ForbiddenException({
      code: ErrorCode.ModNotOwned,
    })

    const toUpdate = {
      ...data,
      authorId: undefined,
      lastUpdate: new Date(),
    }

    await this.bmods.update(id, toUpdate);

    this.logger.log(`Modified boosty mod ${mod.id} by ${mod.author.username}`);

    return this.findOne(mod.id);
  }

  async getModifyData(id: string, userId: string) {
    const data = await this.bmods.findOne({
      where: {
        id,
      },
      relations: [ 'author' ],
    });

    if (!data)
      throw new NotFoundException({
        code: ErrorCode.ModNotFound,
      });

    if (data.author.id !== userId && !(await this.users.checkModeratorPermission(userId))) throw new ForbiddenException({
      code: ErrorCode.ModNotOwned,
    })

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
}
