import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { RequireAuth } from '@auth/auth.decorator';
import { TokenData } from '@auth/token.decorator';
import { TokenPayload } from '@app/types/auth/Token';
import { FastifyReply } from 'fastify';
import { Limits } from '@app/types/limits.enum';
import { PresetsService } from './presets.service';
import { CreatePresetDTO } from '@dto/CreatePresetDTO';
import { ModifyPresetDTO } from '@dto/ModifyPresetDTO';
import { FindAllPresetsQueryDTO } from '@dto/FindAllPresetsQueryDTO';

@Controller('presets')
export class PresetsController {
  constructor(
    private readonly presets: PresetsService,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.presets.findOne(id);
  }

  @Get()
  async findAll(@Query() query: FindAllPresetsQueryDTO) {
    return this.presets.findAll(query.tags, query.page ?? 1, query.limit ?? Limits.DefaultRecPerPageLimit);
  }

  @Post()
  @RequireAuth()
  async create(@TokenData() token: TokenPayload, @Body() body: CreatePresetDTO) {
    return this.presets.create({
      ...body,
      authorId: token.id,
    });
  }

  @Patch(':id')
  @RequireAuth()
  async modify(@Param('id') id: string, @TokenData() token: TokenPayload, @Body() body: ModifyPresetDTO) {
    return this.presets.modify(id, token.id, {
      ...body,
      authorId: token.id,
    });
  }

  @Delete(':id')
  @RequireAuth()
  async delete(@Param('id') id: string, @TokenData() token: TokenPayload) {
    return this.presets.delete(id, token.id);
  }

  @Get(':id/download')
  async download(@Res() reply: FastifyReply, @Param('id') id: string) {
    const mod = await this.presets.findOne(id);

    await this.presets.increaseDownloads(id);

    return reply.status(HttpStatus.PERMANENT_REDIRECT).redirect(mod.downloadLink);
  }
}
