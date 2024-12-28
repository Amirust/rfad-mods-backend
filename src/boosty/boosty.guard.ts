import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { BOOSTY_DECORATOR_KEY } from '@app/types/constants';
import { WithToken } from '@app/types/auth/Token';
import { ErrorCode } from '@app/types/ErrorCode.enum';
import { AuthService } from '@auth/auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class BoostyGuard implements CanActivate {
  private readonly logger = new Logger(BoostyGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireBoosty = this.reflector.getAllAndOverride(BOOSTY_DECORATOR_KEY, [
      context.getHandler(),
      context.getClass,
    ]);

    if (!requireBoosty) return true;

    const fastifyRequest = context
      .switchToHttp()
      .getRequest<WithToken<FastifyRequest>>();

    if (fastifyRequest.headers.authorization === undefined)
      if (requireBoosty)
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

    const data = await this.auth.decodeToken(token);

    if (!(await this.users.checkBoostyPermission(data.id))) {
      throw new UnauthorizedException({ code: ErrorCode.UserHasNoBoostyAccess });
    }

    this.logger.verbose(
      `Token decoded. User ${data.id} has Boosty permission`,
    );
    return true;
  }
}
