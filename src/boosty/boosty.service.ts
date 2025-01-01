import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ArrayContains, Repository } from 'typeorm';
import { BoostyMod } from '@app/db/entity/BoostyMod';
import { InjectRepository } from '@nestjs/typeorm';
import { ModTags } from '@app/types/mod-tags.enum';
import { BoostyFindResultDTO } from '@dto/BoostyFindResultDTO';
import { ErrorCode } from '@app/types/ErrorCode.enum';
import { BoostyModDTO } from '@dto/BoostyModDTO';
import { UsersService } from '../users/users.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class BoostyService {
  private readonly logger = new Logger(BoostyService.name);

  constructor(
    @InjectRepository(BoostyMod)
    private readonly bmods: Repository<BoostyMod>,
    private readonly users: UsersService,
    private readonly cache: CacheService,
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

  async increaseDownloads(id: string) {
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

    this.logger.log(`Increased downloads for mod ${mod.id} to ${mod.downloads}`);
  }
}
