import { ModTags } from '@app/types/mod-tags.enum';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindAllModsQueryDTO {
  @IsOptional()
  @IsArray()
  @IsEnum(ModTags, { each: true })
  @Transform(({ value }) => {
    if (!value) return [];
    return (typeof value === 'string' ? value.split(',') : value).map(Number);
  })
  declare tags: ModTags[];

  @IsOptional()
  @IsNumber()
  declare page: number;

  @IsOptional()
  @IsNumber()
  declare limit: number;
}