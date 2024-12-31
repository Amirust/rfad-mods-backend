import { Column, Entity, ManyToOne } from 'typeorm';
import { PresetTags } from '@app/types/preset-tags.enum';
import { VersionsEnum } from '@app/types/mods/versions.enum';
import { User } from '@app/db/entity/User';
import { AdditionalLink } from '@app/types/mods/AdditionalLink';

// I didn't use extends because this version of TypeORM has bugs.
// https://github.com/typeorm/typeorm/issues/10895
@Entity('preset_mods')
export class PresetMod {
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
    enum: PresetTags,
    array: true,
  })
  declare tags: PresetTags[]

  @ManyToOne(() => User, u => u.mods)
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