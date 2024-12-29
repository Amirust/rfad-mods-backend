import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ModsService } from './mods.service';
import { FindAllModsQueryDTO } from '@dto/FindAllModsQueryDTO';
import { RequireAuth } from '@auth/auth.decorator';
import { TokenData } from '@auth/token.decorator';
import { TokenPayload } from '@app/types/auth/Token';
import { CreateModDTO } from '@dto/CreateModDTO';
import { ModifyModDTO } from '@dto/ModifyModDTO';
import { FastifyReply } from 'fastify';
import { RequireBoosty } from '../boosty/boosty.decorator';
import { BoostyGuard } from '../boosty/boosty.guard';
import { Limits } from '@app/types/limits.enum';

@Controller('mods')
@UseGuards(BoostyGuard)
export class ModsController {
  constructor(
    private readonly mods: ModsService,
  ) {}

  @Get(':id')
  @RequireBoosty()
  async findOne(id: string) {
    return this.mods.findOne(id);
  }

  @Get()
  async findAll(@Query() query: FindAllModsQueryDTO) {
    return this.mods.findAll(query.tags, query.page ?? 1, query.limit ?? Limits.DefaultRecPerPageLimit);
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

  @Get(':id/download')
  async download(@Res() reply: FastifyReply, @Param('id') id: string) {
    const mod = await this.mods.findOne(id);

    await this.mods.increaseDownloads(id);

    return reply.status(HttpStatus.PERMANENT_REDIRECT).redirect(mod.downloadLink);
  }
}
