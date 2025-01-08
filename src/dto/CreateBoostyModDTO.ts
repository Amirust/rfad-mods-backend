import { IsEnum } from 'class-validator';
import { BoostyTierEnum } from '@app/types/djs/boosty-tier.enum';
import { CreateModDTO } from '@dto/CreateModDTO';

export class CreateBoostyModDTO extends CreateModDTO {
  @IsEnum(BoostyTierEnum)
  declare requiredTier: BoostyTierEnum
}