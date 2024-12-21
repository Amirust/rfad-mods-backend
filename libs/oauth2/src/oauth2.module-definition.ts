import { ConfigurableModuleBuilder, Inject } from '@nestjs/common'
import { Oauth2ConfigInterface } from '@app/oauth2/interfaces/oauth2-config.interface'

const moduleDef = new ConfigurableModuleBuilder<Oauth2ConfigInterface>().build()

const InjectOauth2Symbol = Symbol('InjectOauth2Config')

export const Oauth2ModuleDefinition = moduleDef.ConfigurableModuleClass
export const InjectOauth2Config = () => Inject(moduleDef.MODULE_OPTIONS_TOKEN)

