import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { AUTH_DECORATOR_KEY } from '@app/types/constants';
import { TOKEN_KEY, WithToken } from '@app/types/auth/Token';
import { ErrorCode } from '@app/types/ErrorCode.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireAuth = this.reflector.getAllAndOverride(AUTH_DECORATOR_KEY, [
      context.getHandler(),
      context.getClass,
    ]);

    if (!requireAuth) return true;

    const fastifyRequest = context
      .switchToHttp()
      .getRequest<WithToken<FastifyRequest>>();

    if (fastifyRequest.headers.authorization === undefined)
      if (requireAuth)
        throw new UnauthorizedException({ code: ErrorCode.TokenInvalid });
      else return true;
    const segments = fastifyRequest.headers.authorization.split(' ');
    if (segments.length !== 2 || segments[0] !== 'Bearer') {
      throw new UnauthorizedException({ code: ErrorCode.TokenInvalid });
    }

    const token: string = segments[1];

    try {
      await this.auth.verifyToken(token);
    } catch (e) {
      throw new UnauthorizedException({ code: ErrorCode.TokenInvalid });
    }

    fastifyRequest[TOKEN_KEY] = await this.auth.decodeToken(token);
    this.logger.verbose(
      `Token decoded. User ${fastifyRequest[TOKEN_KEY].id} Authenticated`,
    );
    return true;
  }
}
