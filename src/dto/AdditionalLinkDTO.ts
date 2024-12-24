import { IsString, IsUrl } from 'class-validator';

export class AdditionalLinkDTO {
  @IsString()
  declare name: string

  @IsUrl()
  declare url: string
}