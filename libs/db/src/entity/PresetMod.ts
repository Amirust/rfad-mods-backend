import { Column, Entity, ManyToOne } from 'typeorm';
import { PresetTags } from '@app/types/preset-tags.enum';
import { User } from '@app/db/entity/User';
import { AdditionalLink } from '@app/types/mods/AdditionalLink';
import { SnowflakeId } from '@app/db/entity/SnowflakeId';

// I didn't use extends because this version of TypeORM has bugs.
// https://github.com/typeorm/typeorm/issues/10895
@Entity('preset_mods')
export class PresetMod extends SnowflakeId {
  @Column()
  declare name: string

  @Column()
  declare shortDescription: string

  @Column()
  declare description: string

  @Column({
    default: ''
  })
  declare installGuide: string

  @Column({
    default: 0
  })
  declare downloads: number

  @Column()
  declare lastUpdate: Date

  @Column({
    type: 'enum',
    enum: PresetTags,
    array: true,
  })
  declare tags: PresetTags[]

  @ManyToOne(() => User, u => u.presets)
  declare author: User

  @Column()
  declare downloadLink: string

  @Column({
    type: 'jsonb',
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