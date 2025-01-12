import { Column, Entity, Index } from 'typeorm';
import { SnowflakeId } from '@app/db/entity/SnowflakeId';

@Entity('old_downloads')
export class OldDownloadHistory extends SnowflakeId {
  @Column()
  @Index()
  declare modId: string

  @Column({
    nullable: true
  })
  declare userId?: string

  @Column()
  declare type: 'mod' | 'preset'

  @Column()
  @Index()
  declare timestamp: Date
}