import { PresetTags } from '@app/types/preset-tags.enum';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';


export class FindAllPresetsQueryDTO {
  @IsOptional()
  @IsArray()
  @IsEnum(PresetTags, { each: true })
  @Transform(({ value }) => {
    if (!value) return [];
    return (typeof value === 'string' ? value.split(',') : value).map(Number);
  })
  declare tags: PresetTags[];

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    if (!value) return 1;
    return +value
  })
  declare page: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) =>
    +value
  )
  declare limit: number;
}