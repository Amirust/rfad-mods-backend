import {
  ArrayMaxSize,
  ArrayMinSize,
  IsEnum, IsOptional,
  IsString,
  IsUrl, MaxLength,
  MinLength,
  ValidateNested
} from 'class-validator';
import { ModTags } from '@app/types/mod-tags.enum';
import { VersionsEnum } from '@app/types/mods/versions.enum';
import { AdditionalLinkDTO } from '@dto/AdditionalLinkDTO';
import { Type } from 'class-transformer';
import { Limits } from '@app/types/limits.enum';

export class CreateModDTO {
  @IsOptional()
  @IsString()
  declare authorId: string

  @IsString()
  @MinLength(1)
  @MaxLength(Limits.ModNameMaxLength)
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

  @IsEnum(VersionsEnum, { each: true })
  declare versions: VersionsEnum[]

  @IsEnum(ModTags, { each: true })
  @ArrayMinSize(Limits.MinTagsPerMod)
  @ArrayMaxSize(Limits.MaxTagsPerMod)
  declare tags: ModTags[]

  @IsString()
  declare downloadLink: string

  @ValidateNested({ each: true })
  @Type(() => AdditionalLinkDTO)
  declare additionalLinks: AdditionalLinkDTO[]

  @IsUrl({}, { each: true })
  declare images: string[]
}