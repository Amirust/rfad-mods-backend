import { IsNumber, ValidateNested } from 'class-validator';
import { ModDTO } from '@dto/ModDTO';
import { Type } from 'class-transformer';

export class FindResultDTO {
  @IsNumber()
  declare totalPages: number;

  @ValidateNested({ each: true })
  @Type(() => ModDTO)
  declare mods: ModDTO[];
}