import { CreateModDTO } from '@dto/CreateModDTO';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PublicPartialUserDTO } from '@dto/PublicPartialUserDTO';

export class ModDTO extends CreateModDTO {
  @IsString()
  declare id: string

  @Type(() => PublicPartialUserDTO)
  declare author: PublicPartialUserDTO

  @IsNumber()
  declare downloads: number

  @IsDate()
  declare lastUpdate: Date
}