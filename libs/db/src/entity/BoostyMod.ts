import { Column, Entity } from 'typeorm';
import { Mod } from '@app/db/entity/Mod';
import { BoostyTierEnum } from '@app/types/djs/boosty-tier.enum';

@Entity('boosty_mods')
export class BoostyMod extends Mod {
  @Column({
    type: 'enum',
    enum: BoostyTierEnum,
    default: BoostyTierEnum.Nobility
  })
  declare requiredTier: BoostyTierEnum
}