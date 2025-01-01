import { SetMetadata } from '@nestjs/common';
import { BOOSTY_DECORATOR_KEY } from '@app/types/constants';
import { BoostyTierEnum } from '@app/types/djs/boosty-tier.enum';

export const RequireBoosty = (value = true, minimalTier?: BoostyTierEnum) =>
  SetMetadata(BOOSTY_DECORATOR_KEY, { value, minimalTier });
