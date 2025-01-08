import { IsEnum, IsOptional } from 'class-validator';
import { BoostyTierEnum } from '@app/types/djs/boosty-tier.enum';
import { ModifyModDTO } from '@dto/ModifyModDTO';

export class ModifyBoostyModDTO extends ModifyModDTO {
  @IsOptional()
  @IsEnum(BoostyTierEnum)
  declare requiredTier: BoostyTierEnum
}