import { SetMetadata } from '@nestjs/common';
import { AUTH_DECORATOR_KEY } from '@app/types/constants';

export const RequireAuth = (value = true) =>
  SetMetadata(AUTH_DECORATOR_KEY, value);
