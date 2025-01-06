import { IsNumber } from 'class-validator';

export class FilesQuotaDTO {
  @IsNumber()
  declare limit: number

  @IsNumber()
  declare uploaded: number

  @IsNumber()
  declare remaining: number
}