import { PublicPartialUserDTO } from '@dto/PublicPartialUserDTO';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ModTags } from '@app/types/mod-tags.enum';

export class PublicFullUserDTO extends PublicPartialUserDTO {
  @IsString()
  declare mostPopularModId: string

  @IsNumber()
  declare modsPublished: number

  @IsDate()
  @IsOptional()
  declare lastActivity?: Date

  @IsEnum(ModTags, { each: true })
  declare mostUsedTags: ModTags[]
}