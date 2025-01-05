import { IsNumber, IsString } from 'class-validator';

export class UploadedFileResultDTO {
  @IsString()
  declare hash: string

  @IsNumber()
  declare remainingFiles: number
}