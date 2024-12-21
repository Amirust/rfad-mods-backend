import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectOauth2Config } from '@app/oauth2/oauth2.module-definition'
import { Oauth2ConfigInterface } from '@app/oauth2/interfaces/oauth2-config.interface'
import DiscordOAuth2 from 'discord-oauth2'
import { ErrorCode } from '@app/types/ErrorCode.enum';

@Injectable()
export class Oauth2Service {
  private readonly oauth: DiscordOAuth2
  private readonly logger = new Logger(Oauth2Service.name)

  constructor(
    @InjectOauth2Config() private readonly config: Oauth2ConfigInterface,
  ) {
    this.oauth = new DiscordOAuth2()

    this.oauth.on('debug', this.logger.debug.bind(this.logger))
    this.oauth.on('warn', this.logger.warn.bind(this.logger))
  }

  async exchange(code: string, redirect: string) {
    try {
      return await this.oauth.tokenRequest({
        grantType: 'authorization_code',
        code,
        scope: this.config.scopes,
        clientId: this.config.id,
        clientSecret: this.config.secret,
        redirectUri: redirect,
      })
    } catch(e) {
      console.log(e)
      throw new BadRequestException({ code: ErrorCode.ThirdPartyFail })
    }
  }

  async refresh(refreshToken: string) {
    try {
      return await this.oauth.tokenRequest({
        grantType: 'refresh_token',
        refreshToken,
        scope: this.config.scopes,
        clientId: this.config.id,
        clientSecret: this.config.secret,
      })
    } catch {
      throw new BadRequestException({ code: ErrorCode.ThirdPartyTokenRefreshFail })
    }
  }

  async fetchUserInfo(token: string) {
    try {
      return await this.oauth.getUser(token)
    } catch {
      throw new BadRequestException({ code: ErrorCode.ThirdPartyFail })
    }
  }

  async fetchUserConnections(token: string) {
    try {
      return await this.oauth.getUserConnections(token)
    } catch {
      throw new BadRequestException({ code: ErrorCode.ThirdPartyFail })
    }
  }

  generateAuthUrl(redirect: string) {
    return this.oauth.generateAuthUrl({
      clientId: this.config.id,
      redirectUri: redirect,
      scope: this.config.scopes.split('+'),
    })
  }
}
