import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Oauth2Dto } from '@app/oauth2/dto/oauth2.dto';
import { RequireAuth } from '@auth/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('authorize')
  async authorize(@Body() body: Oauth2Dto) {
    return this.auth.exchange(body.code, body.redirect)
  }

  @Get('verify')
  @RequireAuth()
  async verify() {
    return true
  }
}
