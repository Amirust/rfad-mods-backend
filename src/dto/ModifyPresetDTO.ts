import {
  ArrayMaxSize,
  ArrayMinSize,
  IsEnum, IsOptional,
  IsString,
  IsUrl, MaxLength,
  MinLength,
  ValidateNested
} from 'class-validator';
import { AdditionalLinkDTO } from '@dto/AdditionalLinkDTO';
import { Type } from 'class-transformer';
import { Limits } from '@app/types/limits.enum';
import { PresetTags } from '@app/types/preset-tags.enum';

export class ModifyPresetDTO {
  @IsOptional()
  @IsString()
  declare authorId: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  declare name?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(Limits.ModShortDescriptionMaxLength)
  declare shortDescription?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(Limits.ModDescriptionMaxLength)
  declare description?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(Limits.ModInstallGuideMaxLength)
  declare installGuide?: string

  @IsOptional()
  @IsEnum(PresetTags, { each: true })
  @ArrayMinSize(Limits.MinTagsPerMod)
  @ArrayMaxSize(Limits.MaxTagsPerMod)
  declare tags?: PresetTags[]

  @IsOptional()
  @IsString()
  declare downloadLink?: string

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AdditionalLinkDTO)
  declare additionalLinks?: AdditionalLinkDTO[]

  @IsOptional()
  @IsUrl({}, { each: true })
  declare images?: string[]
}