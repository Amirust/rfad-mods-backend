import { IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BoostyModDTO } from '@dto/BoostyModDTO';

export class BoostyFindResultDTO {
  @IsNumber()
  declare totalPages: number;

  @ValidateNested({ each: true })
  @Type(() => BoostyModDTO)
  declare mods: Omit<BoostyModDTO, 'downloadLink' | 'additionalLinks'>[];
}