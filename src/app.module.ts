import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseModule } from '@app/response';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnowflakeModule } from '@app/snowflake';
import { User } from '@app/db/entity/User';
import { Mod } from '@app/db/entity/Mod';
import { AuthController } from '@auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { Oauth2Module } from '@app/oauth2';
import { AuthGuard } from '@auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from '@auth/auth.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { DjsModule } from '@app/djs';
import { GatewayIntentBits } from 'discord-api-types/v10';
import { Client } from 'discord.js';
import { CommandsModule } from '@app/commands';
import { ModsController } from './mods/mods.controller';
import { ModsService } from './mods/mods.service';
import { DiscordService } from './discord/discord.service';
import { MessageTemplateModule } from '@app/message-template';
import { BoostyController } from './boosty/boosty.controller';
import { BoostyService } from './boosty/boosty.service';
import { CacheService } from './cache/cache.service';
import { PresetsController } from './presets/presets.controller';
import { PresetsService } from './presets/presets.service';
import { BoostyMod } from '@app/db/entity/BoostyMod';
import { PresetMod } from '@app/db/entity/PresetMod';
import { FilesController } from './files/files.controller';
import { FilesService } from './files/files.service';
import { FastifyMulterModule } from '@nest-lab/fastify-multer';
import { PopularController } from './popular/popular.controller';
import { PopularService } from './popular/popular.service';
import { RecentDownloadHistory } from '@app/db/entity/RecentDownloadHistory';
import { OldDownloadHistory } from '@app/db/entity/OldDownloadHistory';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow('DATABASE'),
        synchronize: true,
        logging: false,
        entities: [
          User,
          Mod,
          BoostyMod,
          PresetMod,
          RecentDownloadHistory,
          OldDownloadHistory,
        ],
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Mod,
      BoostyMod,
      PresetMod,
      RecentDownloadHistory,
      OldDownloadHistory,
    ]),
    ResponseModule,
    SnowflakeModule,
    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
        global: true,
        signOptions: { expiresIn: config.getOrThrow('JWT_EXPIRES_IN') },
      }),
    }),
    Oauth2Module.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: (cfg: ConfigService) => ({
        id: cfg.getOrThrow('DISCORD_APP_ID'),
        scopes: cfg.getOrThrow('DISCORD_OAUTH2_SCOPES'),
        secret: cfg.getOrThrow('DISCORD_CLIENT_SECRET'),
        token: cfg.getOrThrow('DISCORD_TOKEN'),
      }),
    }),
    DjsModule.forRootAsync({
      imports: [ ConfigModule ],
      useFactory: (cfg: ConfigService) => ({
        token: cfg.getOrThrow('DISCORD_TOKEN'),
        client: () => {
          return new Client({
            intents: [
              GatewayIntentBits.Guilds,
              GatewayIntentBits.GuildMembers,
              GatewayIntentBits.GuildMessages,
              GatewayIntentBits.MessageContent
            ],
            presence: {
              status: 'idle',
            }
          })
        }
      }),
      inject: [ ConfigService ]
    }),
    CommandsModule,
    MessageTemplateModule,
    FastifyMulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB,
      }
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [ AppController, AuthController, UsersController, ModsController, BoostyController, PresetsController, FilesController, PopularController ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
    UsersService,
    ModsService,
    DiscordService,
    BoostyService,
    CacheService,
    PresetsService,
    FilesService,
    PopularService
  ],
})
export class AppModule {}