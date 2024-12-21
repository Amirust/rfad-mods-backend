import { IsString } from 'class-validator'

export class Oauth2Dto {
  // discord oauth2 code (https://discordapp.com/developers/docs/topics/oauth2) ('grant_type': 'authorization_code')
  @IsString()
  declare code: string

  @IsString()
  declare redirect: string
}
