import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Oauth2Dto } from '@app/oauth2/dto/oauth2.dto';
import { RequireAuth } from '@auth/auth.decorator';
import { RequireBoosty } from '../boosty/boosty.decorator';
import { AuthGuard } from '@auth/auth.guard';
import { BoostyGuard } from '../boosty/boosty.guard';

@Controller('auth')
@UseGuards(AuthGuard, BoostyGuard)
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('authorize')
  async authorize(@Body() body: Oauth2Dto) {
    return {
      token: await this.auth.exchange(body.code, body.redirect),
    }
  }

  @Get('verify')
  @RequireAuth()
  async verify() {
    return true
  }

  @Get('boosty')
  @RequireBoosty()
  async boosty() {
    return true
  }
}
