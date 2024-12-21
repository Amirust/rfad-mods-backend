import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TOKEN_KEY, WithToken } from '@app/types/auth/Token';

export const TokenData = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const tokenData = context.switchToHttp().getRequest<WithToken<object>>();
    return tokenData[TOKEN_KEY];
  },
);
