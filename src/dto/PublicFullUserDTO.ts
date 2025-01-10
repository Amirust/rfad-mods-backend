import { PublicPartialUserDTO } from '@dto/PublicPartialUserDTO';
import { IsArray, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { ModTags } from '@app/types/mod-tags.enum';
import { ModDTO } from '@dto/ModDTO';
import { PresetDTO } from '@dto/PresetDTO';
import { PresetTags } from '@app/types/preset-tags.enum';

export type ModPresetType = (Omit<(ModDTO | PresetDTO) & { type: 'mod' | 'preset' }, 'author'>)[]

export class PublicFullUserDTO extends PublicPartialUserDTO {
  @IsString()
  declare mostPopularModId: string

  @IsNumber()
  declare modsPublished: number

  @IsDate()
  @IsOptional()
  declare lastActivity?: Date

  @IsArray()
  declare mostUsedTags: (ModTags | PresetTags)[]

  @IsArray()
  declare mods: ModPresetType
}