import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OldDownloadHistory } from '@app/db/entity/OldDownloadHistory';
import { LessThan, Repository } from 'typeorm';
import { RecentDownloadHistory } from '@app/db/entity/RecentDownloadHistory';
import { SnowflakeService } from '@app/snowflake';
import { Cron, CronExpression } from '@nestjs/schedule';

interface PopularModDBResp {
  modId: string;
  type: 'mod' | 'preset';
  downloadCount: number;
}
type PopularModResp = Omit<PopularModDBResp, 'downloadCount'>;

@Injectable()
export class PopularService implements OnModuleInit {
  private readonly logger = new Logger(PopularService.name);
  private cache: PopularModResp[] = [];

  constructor(
    private readonly snowflake: SnowflakeService,

    @InjectRepository(OldDownloadHistory)
    private readonly old: Repository<OldDownloadHistory>,
    @InjectRepository(RecentDownloadHistory)
    private readonly recent: Repository<RecentDownloadHistory>,
  ) {}

  async onModuleInit() {
    this.cache = await this.fetchPopular();
  }

  async processDownload(
    modId: string,
    type: 'mod' | 'preset',
    userId?: string,
  ): Promise<void> {
    await this.recent.save({
      id: this.snowflake.nextStringId(),
      modId,
      userId,
      type,
      timestamp: new Date(),
    });
  }

  async fetchPopular() {
    const data: PopularModDBResp[] = await this.recent
      .createQueryBuilder('recent_downloads')
      .select('recent_downloads.modId', 'modId')
      .addSelect('recent_downloads.type', 'type')
      .addSelect('COUNT(recent_downloads.modId)', 'downloadCount')
      .groupBy('recent_downloads.modId')
      .addGroupBy('recent_downloads.type')
      .orderBy('"downloadCount"', 'DESC')
      .limit(3)
      .getRawMany();

    this.logger.log('Fetched popular mods');

    return data.map(({ modId, type }) => ({
      modId,
      type,
    }));
  }

  getPopular() {
    return this.cache;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updatePopular() {
    this.cache = await this.fetchPopular();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async clearOld() {
    const toMove = await this.recent.find({
      where: {
        timestamp: LessThan(new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)),
      },
    })

    await this.old.save(toMove);
    await this.recent.delete(toMove.map(({ id }) => id));

    this.logger.log(`Moved ${toMove.length} old download records to old_downloads`);
  }
}
