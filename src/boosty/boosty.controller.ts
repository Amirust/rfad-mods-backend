import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { BoostyService } from './boosty.service';
import { RequireBoosty } from './boosty.decorator';
import { BoostyTierEnum } from '@app/types/djs/boosty-tier.enum';
import { FindAllModsQueryDTO } from '@dto/FindAllModsQueryDTO';
import { Limits } from '@app/types/limits.enum';
import { TokenData } from '@auth/token.decorator';
import { TokenPayload } from '@app/types/auth/Token';
import { FastifyReply } from 'fastify';

@Controller('boosty')
export class BoostyController {
  constructor(private readonly bmods: BoostyService) {}

  @Get(':id')
  @RequireBoosty()
  async findOne(@Param('id') id: string) {
    return this.bmods.findOne(id);
  }

  @Get()
  @RequireBoosty({
    minimalTier: BoostyTierEnum.Nobility,
  })
  async findAll(@Query() query: FindAllModsQueryDTO, @TokenData() token: TokenPayload) {
    return this.bmods.findAll(query.tags, query.page ?? 1, query.limit ?? Limits.DefaultRecPerPageLimit, token.id);
  }

  @Get(':id/download')
  @RequireBoosty()
  async download(@Res() reply: FastifyReply, @Param('id') id: string, @TokenData() token: TokenPayload) {
    const mod = await this.bmods.findOne(id);

    await this.bmods.increaseDownloads(id, token.id);

    return reply.status(HttpStatus.PERMANENT_REDIRECT).redirect(mod.downloadLink);
  }
}
