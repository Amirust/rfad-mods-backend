import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { TokenData } from '@auth/token.decorator';
import { TokenPayload } from '@app/types/auth/Token';
import { RequireAuth } from '@auth/auth.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly users: UsersService
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.users.findOne(id)
  }

  @Get('@me')
  @RequireAuth()
  async findMe(@TokenData() token: TokenPayload) {
    return this.users.findOne(token.id)
  }

  @Get(':id/full')
  async findOneFull(@Param('id') id: string) {
    return this.users.findOneFull(id)
  }

  @Get('@me/full')
  @RequireAuth()
  async findMyMods(@TokenData() token: TokenPayload) {
    return this.users.findOneFull(token.id)
  }
}
