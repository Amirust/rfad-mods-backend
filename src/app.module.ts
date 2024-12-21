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

@Module({
  imports: [
    ConfigModule.forRoot(),
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
          Mod
        ],
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Mod
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
  ],
  controllers: [ AppController, AuthController ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService
  ],
})
export class AppModule {}