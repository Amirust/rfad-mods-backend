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

export class CreatePresetDTO {
  @IsOptional()
  @IsString()
  declare authorId: string

  @IsString()
  @MinLength(1)
  declare name: string

  @IsString()
  @MinLength(1)
  @MaxLength(Limits.ModShortDescriptionMaxLength)
  declare shortDescription: string

  @IsString()
  @MinLength(1)
  @MaxLength(Limits.ModDescriptionMaxLength)
  declare description: string

  @IsString()
  @MinLength(1)
  @MaxLength(Limits.ModInstallGuideMaxLength)
  declare installGuide: string

  @IsEnum(PresetTags, { each: true })
  @ArrayMinSize(Limits.MinTagsPerMod)
  @ArrayMaxSize(Limits.MaxTagsPerMod)
  declare tags: PresetTags[]

  @IsString()
  declare downloadLink: string

  @ValidateNested({ each: true })
  @Type(() => AdditionalLinkDTO)
  declare additionalLinks: AdditionalLinkDTO[]

  @IsUrl({}, { each: true })
  declare images: string[]
}