import { SetMetadata } from '@nestjs/common';
import { BOOSTY_DECORATOR_KEY } from '@app/types/constants';
import { BoostyTierEnum } from '@app/types/djs/boosty-tier.enum';

export interface RequireBoostyParams {
  require?: boolean;
  minimalTier?: BoostyTierEnum;
}

export const RequireBoosty = (params?: RequireBoostyParams) =>
  SetMetadata(BOOSTY_DECORATOR_KEY, {
    value: params?.require ?? true,
    minimalTier: params?.minimalTier,
  });
