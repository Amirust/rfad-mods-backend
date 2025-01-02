import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from '@app/db/entity/User';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PublicPartialUserDTO } from '@dto/PublicPartialUserDTO';
import { ErrorCode } from '@app/types/ErrorCode.enum';
import { PublicFullUserDTO } from '@dto/PublicFullUserDTO';
import { TimeLimits } from '@app/types/time-limits';
import { DjsService } from '@app/djs';
import { ConfigService } from '@nestjs/config';
import { BoostyTierEnum } from '@app/types/djs/boosty-tier.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,

    private readonly config: ConfigService,
    private readonly djs: DjsService
  ) {}

  async findOne(id: string): Promise<PublicPartialUserDTO> {
    const data = await this.users.findOneBy({
      id,
    });

    if (!data) {
      throw new NotFoundException({
        code: ErrorCode.UserNotFound,
      });
    }

    void this.softUpdate(data)

    return {
      id: data.id,
      username: data.username,
      avatarHash: data.avatarHash,
      globalName: data.globalName,
    };
  }

  async findOneFull(id: string): Promise<PublicFullUserDTO> {
    const data = await this.users.findOne({
      where: { id },
      relations: [ 'mods' ],
    });

    if (!data) {
      throw new NotFoundException({
        code: ErrorCode.UserNotFound,
      });
    }

    const { username, globalName, avatarHash, mods } = data

    void this.softUpdate(data)

    return {
      id,
      username,
      avatarHash,
      globalName,
      mostPopularModId: mods.sort((a, b) => b.downloads - a.downloads)[0]?.id ?? '',
      modsPublished: mods.length,
      lastActivity: mods.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0]?.updatedAt ?? null,
      mostUsedTags: [], // TODO: Implement this
    };
  }

  async getRawUser(id: string): Promise<User> {
    const data = await this.users.findOneBy({
      id,
    });

    if (!data) {
      throw new NotFoundException({
        code: ErrorCode.UserNotFound,
      });
    }

    void this.softUpdate(data)

    return data
  }

  async checkBoostyPermission(id: string, requiredTier: BoostyTierEnum): Promise<boolean> {
    if (!Boolean(this.config.get<boolean>('DISCORD_FUNCTIONAL_ENABLED'))) throw new NotFoundException({
      code: ErrorCode.FunctionalDisabled,
    })

    const data = await this.users.findOneBy({
      id,
    });

    if (!data) {
      throw new NotFoundException({
        code: ErrorCode.UserNotFound,
      });
    }

    const allTiers = this.config.getOrThrow<string>('GUILD_BOOSTY_TIERS').split(',').map((tier, index) => {
      return {
        tier: index + 1 as BoostyTierEnum,
        roleId: tier === 'NONE' ? '' : tier
      }
    })

    void this.softUpdate(data)

    const guild = await this.djs.client.guilds.fetch(this.config.getOrThrow<string>('DISCORD_GUILD_ID'))
    const member = await guild.members.fetch(id)

    const userRoles = member.roles.cache.map(role => role.id)
    const userHasTiers = allTiers.filter(tier => userRoles.includes(tier.roleId))

    return userHasTiers.some(tier => tier.tier >= requiredTier)
  }

  async checkBoostyPermissionBulk(id: string, requiredTiers: BoostyTierEnum[]): Promise<boolean[]> {
    if (!Boolean(this.config.get<boolean>('DISCORD_FUNCTIONAL_ENABLED'))) throw new NotFoundException({
      code: ErrorCode.FunctionalDisabled,
    })

    const data = await this.users.findOneBy({
      id,
    });

    if (!data) {
      throw new NotFoundException({
        code: ErrorCode.UserNotFound,
      });
    }

    const allTiers = this.config.getOrThrow<string>('GUILD_BOOSTY_TIERS').split(',').map((tier, index) => {
      return {
        tier: index + 1 as BoostyTierEnum,
        roleId: tier === 'NONE' ? '' : tier
      }
    })

    void this.softUpdate(data)

    const guild = await this.djs.client.guilds.fetch(this.config.getOrThrow<string>('DISCORD_GUILD_ID'))
    const member = await guild.members.fetch(id)

    const userRoles = member.roles.cache.map(role => role.id)
    const userHasTiers = allTiers.filter(tier => userRoles.includes(tier.roleId))

    return requiredTiers.map(requiredTier => userHasTiers.some(tier => tier.tier >= requiredTier))
  }

  async checkModeratorPermission(id: string): Promise<boolean> {
    if (!Boolean(this.config.get<boolean>('DISCORD_FUNCTIONAL_ENABLED'))) throw new NotFoundException({
      code: ErrorCode.FunctionalDisabled,
    })

    const data = await this.users.findOneBy({
      id,
    });

    if (!data) {
      throw new NotFoundException({
        code: ErrorCode.UserNotFound,
      });
    }

    void this.softUpdate(data)

    const guild = await this.djs.client.guilds.fetch(this.config.getOrThrow<string>('DISCORD_GUILD_ID'))
    const member = await guild.members.fetch(id)

    const moderatorRoleId = this.config.getOrThrow<string>('DISCORD_MODERATOR_ROLE_ID')

    return member.roles.cache.some(role => role.id === moderatorRoleId)
  }

  private async softUpdate(data: User): Promise<void> {
    if (data.updatedAt.getTime() > Date.now() + TimeLimits.SoftUpdateTimeout) return

    const updatedInfo = await this.djs.client.users.fetch(data.id)

    data.updatedAt = new Date()
    data.username = updatedInfo.username
    data.globalName = updatedInfo.globalName ?? updatedInfo.username
    data.avatarHash = updatedInfo.avatar ?? updatedInfo.defaultAvatarURL

    this.logger.verbose(`SoftUpdate User ${data.id} has been updated.`)

    await this.users.save(data)
  }
}
