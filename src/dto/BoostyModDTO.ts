import { IsBoolean, IsEnum } from 'class-validator';
import { ModDTO } from '@dto/ModDTO';
import { BoostyTierEnum } from '@app/types/djs/boosty-tier.enum';

export class BoostyModDTO extends ModDTO {
  @IsBoolean()
  declare accessible: boolean

  @IsEnum(BoostyTierEnum)
  declare requiredTier: BoostyTierEnum
}