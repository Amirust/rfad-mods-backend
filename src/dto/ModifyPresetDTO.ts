import {
  ArrayMaxSize,
  ArrayMinSize,
  IsEnum, IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested
} from 'class-validator';
import { AdditionalLinkDTO } from '@dto/AdditionalLinkDTO';
import { Type } from 'class-transformer';
import { Limits } from '@app/types/limits.enum';
import { PresetTags } from '@app/types/preset-tags.enum';
import { ImageWithOrientationDTO } from '@dto/ImageWithOrientationDTO';

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
  @ArrayMaxSize(Limits.MaxTagsPerPreset)
  declare tags?: PresetTags[]

  @IsOptional()
  @IsString()
  declare downloadLink?: string

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AdditionalLinkDTO)
  declare additionalLinks?: AdditionalLinkDTO[]

  @IsOptional()
  @ValidateNested({ each: true })
  @ArrayMaxSize(Limits.MaxImagesPerMod)
  @Type(() => ImageWithOrientationDTO)
  declare images: ImageWithOrientationDTO[]
}