import {
  Injectable,
  Logger, UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@app/db/entity/User';
import { JwtService } from '@nestjs/jwt';
import { Oauth2Service } from '@app/oauth2';
import { ConfigService } from '@nestjs/config';
import encrypt from '@app/utils/encrypt';
import decrypt from '@app/utils/decrypt';
import { JwtTokenDTO } from '@dto/JwtTokenDTO';
import { ErrorCode } from '@app/types/ErrorCode.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwt: JwtService,
    private readonly oauth2: Oauth2Service,
    private readonly config: ConfigService
  ) {}

  async exchange(code: string, redirect: string) {
    const token = await this.oauth2.exchange(code, redirect)
    const userData = await this.oauth2.fetchUserInfo(token.access_token)

    let user = await this.users.findOneBy({
      id: userData.id,
    })

    if (!user) {
      user = new User()
      user.id = userData.id
      user.username = userData.username
      user.globalName = userData.global_name ?? user.username
      user.avatarHash = userData.avatar ?? this.config.get('DEFAULT_AVATAR') ?? ''
    }

    user.tokens = {
      accessToken: this.encrypt(token.access_token),
      refreshToken: this.encrypt(token.refresh_token),
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
    }

    await this.users.save(user)

    this.logger.verbose(`User ${user.id} has been authenticated. Token recreated.`)

    return this.jwt.signAsync({ id: user.id, token: token.access_token })
  }

  async verifyToken(token: string) {
    const data = await this.jwt.verifyAsync<JwtTokenDTO>(token, {
      secret: this.config.get('JWT_SECRET'),
    })

    const user = await this.users.findOneBy({
      id: data.id,
    })

    if (!user)
      throw new UnauthorizedException({ code: ErrorCode.TokenInvalid })
  }

  async decodeToken(token: string) {
    return this.jwt.verifyAsync<JwtTokenDTO>(token, {
      secret: this.config.get('JWT_SECRET'),
    })
  }

  private encrypt(text: string): string {
    return encrypt(text, this.config.getOrThrow('ENCRYPT_SECRET'), this.config.getOrThrow('ENCRYPT_IV'))
  }

  private decrypt(text: string): string {
    return decrypt(text, this.config.getOrThrow('ENCRYPT_SECRET'), this.config.getOrThrow('ENCRYPT_IV'))
  }
}
