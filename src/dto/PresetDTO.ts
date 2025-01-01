import { CreatePresetDTO } from '@dto/CreatePresetDTO';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PublicPartialUserDTO } from '@dto/PublicPartialUserDTO';

export class PresetDTO extends CreatePresetDTO {
  @IsString()
  declare id: string

  @Type(() => PublicPartialUserDTO)
  declare author: PublicPartialUserDTO

  @IsNumber()
  declare downloads: number

  @IsDate()
  declare lastUpdate: Date
}