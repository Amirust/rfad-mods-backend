import { IsString } from 'class-validator';

export class JwtTokenDTO {
  @IsString()
  declare id: string;

  @IsString()
  declare token: string;
}