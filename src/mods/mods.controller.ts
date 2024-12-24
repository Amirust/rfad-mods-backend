import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ModsService } from './mods.service';
import { FindAllModsQueryDTO } from '@dto/FindAllModsQueryDTO';
import { RequireAuth } from '@auth/auth.decorator';
import { TokenData } from '@auth/token.decorator';
import { TokenPayload } from '@app/types/auth/Token';
import { CreateModDTO } from '@dto/CreateModDTO';
import { ModifyModDTO } from '@dto/ModifyModDTO';

@Controller('mods')
export class ModsController {
  constructor(
    private readonly mods: ModsService,
  ) {}

  @Get(':id')
  async findOne(id: string) {
    return this.mods.findOne(id);
  }

  @Get()
  async findAll(@Query() query: FindAllModsQueryDTO) {
    return this.mods.findAll(query.tags);
  }

  @Post()
  @RequireAuth()
  async create(@TokenData() token: TokenPayload, @Body() body: CreateModDTO) {
    return this.mods.create({
      ...body,
      authorId: token.id,
    });
  }

  @Patch(':id')
  @RequireAuth()
  async modify(@Param('id') id: string, @TokenData() token: TokenPayload, @Body() body: ModifyModDTO) {
    return this.mods.modify(id, token.id, {
      ...body,
      authorId: token.id,
    });
  }
}
