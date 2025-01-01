import { IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PresetDTO } from '@dto/PresetDTO';

export class FindPresetsResultDTO {
  @IsNumber()
  declare totalPages: number;

  @ValidateNested({ each: true })
  @Type(() => PresetDTO)
  declare mods: PresetDTO[];
}