import { Column, Entity, OneToMany } from 'typeorm';
import { SnowflakeId } from '@app/db/entity/SnowflakeId';
import { Mod } from '@app/db/entity/Mod';
import { Limits } from '@app/types/limits.enum';
import { PresetMod } from '@app/db/entity/PresetMod';

interface UserTokens {
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

@Entity()
export class User extends SnowflakeId {
  @Column()
  declare username: string

  @Column()
  declare globalName: string

  @Column()
  declare avatarHash: string

  @Column({ type: 'jsonb' })
  declare tokens: UserTokens

  @OneToMany(() => Mod, m => m.author)
  declare mods: Mod[]

  @OneToMany(() => PresetMod, m => m.author)
  declare presets: PresetMod[]

  @Column({
    default: 0
  })
  declare uploadedFiles: number

  @Column({
    default: Limits.DefaultUserFilesLimit
  })
  declare filesLimit: number
}