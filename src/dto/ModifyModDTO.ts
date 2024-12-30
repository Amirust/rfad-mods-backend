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

export class ModifyModDTO {
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
  @IsEnum(VersionsEnum, { each: true })
  declare versions?: VersionsEnum[]

  @IsOptional()
  @IsEnum(ModTags, { each: true })
  @ArrayMinSize(Limits.MinTagsPerMod)
  @ArrayMaxSize(Limits.MaxTagsPerMod)
  declare tags?: ModTags[]

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