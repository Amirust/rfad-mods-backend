import { SetMetadata } from '@nestjs/common';
import { BOOSTY_DECORATOR_KEY } from '@app/types/constants';

export const RequireBoosty = (value = true) =>
  SetMetadata(BOOSTY_DECORATOR_KEY, value);
