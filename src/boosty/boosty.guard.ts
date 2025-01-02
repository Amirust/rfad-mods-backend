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
import { BoostyService } from './boosty.service';
import { BoostyTierEnum } from '@app/types/djs/boosty-tier.enum';
import { RequireBoostyParams } from './boosty.decorator';

@Injectable()
export class BoostyGuard implements CanActivate {
  private readonly logger = new Logger(BoostyGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly bmods: BoostyService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const params = this.reflector.getAllAndOverride(BOOSTY_DECORATOR_KEY, [
      context.getHandler(),
      context.getClass,
    ]) as RequireBoostyParams;

    if (!params || !params.require) return true;

    const { require: requireBoosty, minimalTier } = params;

    if (!requireBoosty) return true;

    const fastifyRequest = context
      .switchToHttp()
      .getRequest<WithToken<FastifyRequest>>();

    const id = (fastifyRequest.params as Record<string, any>).id as string; // Mod ID
    if (!id) return true

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
    const mod = await this.bmods.findOne(id);

    if (!(await this.users.checkBoostyPermission(data.id, minimalTier ? minimalTier as BoostyTierEnum : mod.requiredTier))) {
      throw new UnauthorizedException({ code: ErrorCode.UserHasNoBoostyAccess });
    }

    this.logger.verbose(
      `Token decoded. User ${data.id} has Boosty permission`,
    );
    return true;
  }
}
