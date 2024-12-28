import { Column, Entity, ManyToOne } from 'typeorm';
import { SnowflakeId } from '@app/db/entity/SnowflakeId';
import { User } from '@app/db/entity/User';
import { ModTags } from '@app/types/mod-tags.enum';
import { AdditionalLink } from '@app/types/mods/AdditionalLink';
import { VersionsEnum } from '@app/types/mods/versions.enum';

@Entity()
export class Mod extends SnowflakeId {
  @Column()
  declare name: string

  @Column()
  declare shortDescription: string

  @Column()
  declare description: string

  @Column({
    type: 'enum',
    enum: VersionsEnum,
    array: true
  })
  declare versions: VersionsEnum[]

  @Column({
    default: 0
  })
  declare downloads: number

  @Column()
  declare lastUpdate: Date

  @Column({
    type: 'enum',
    enum: ModTags,
    array: true,
  })
  declare tags: ModTags[]

  @ManyToOne(() => User, u => u.mods)
  declare author: User

  @Column()
  declare downloadLink: string

  @Column({
    type: 'jsonb',
    array: true,
    default: []
  })
  declare additionalLinks: AdditionalLink[]

  @Column({
    array: true,
    type: 'text',
    default: []
  })
  declare images: string[]

  // Discord Info

  @Column({
    nullable: true
  })
  declare discordMessageId: string

  @Column({
    nullable: true
  })
  declare discordChannelId: string
}