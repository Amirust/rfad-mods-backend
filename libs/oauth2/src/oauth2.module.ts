import { Module } from '@nestjs/common'
import { Oauth2Service } from './oauth2.service'
import { Oauth2ModuleDefinition } from '@app/oauth2/oauth2.module-definition'
import { DiscoveryModule } from '@nestjs/core'

@Module({
  imports: [
    DiscoveryModule,
  ],
  providers: [ Oauth2Service ],
  exports: [ Oauth2Service ],
})
export class Oauth2Module extends Oauth2ModuleDefinition {}
