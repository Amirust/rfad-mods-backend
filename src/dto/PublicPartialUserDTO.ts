import { IsString } from 'class-validator';

export class PublicPartialUserDTO {
  @IsString()
  declare id: string

  @IsString()
  declare username: string

  @IsString()
  declare globalName: string

  @IsString()
  declare avatarHash: string
}