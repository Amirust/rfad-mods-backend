import { BoostyTierEnum } from '@app/types/djs/boosty-tier.enum';
import { ModDTO } from '@dto/ModDTO';
import { IsBoolean, IsEnum } from 'class-validator';

export class BoostyModDTO extends ModDTO {
  @IsEnum(BoostyTierEnum)
  declare requiredTier: BoostyTierEnum

  @IsBoolean()
  declare accessible: boolean
}