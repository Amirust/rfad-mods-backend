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
  @RequireAuth()
  async findOne(@Param('id') id: string, @TokenData() token: TokenPayload) {
    if (id === '@me') id = token.id
    return this.users.findOne(id)
  }

  @Get(':id/full')
  @RequireAuth()
  async findOneFull(@Param('id') id: string, @TokenData() token: TokenPayload) {
    if (id === '@me') id = token.id
    return this.users.findOneFull(id)
  }
}
