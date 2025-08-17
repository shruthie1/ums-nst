import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  BuildModule,
  UsersModule,
  TelegramModule,
  UserDataModule,
  ClientModule,
  ActiveChannelsModule,
  UpiIdModule,
  Stat1Module,
  Stat2Module,
  PromoteStatModule,
  ChannelsModule,
  TgSignupModule,
  LoggerMiddleware,
  TimestampModule,
  InitModule,
  TransactionModule,
  AuthGuard
} from 'common-tg-service';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [
    forwardRef(() => InitModule),
    forwardRef(() => BuildModule),
    forwardRef(() => UsersModule),
    forwardRef(() => TelegramModule),
    forwardRef(() => UserDataModule),
    forwardRef(() => ClientModule),
    forwardRef(() => ActiveChannelsModule),
    forwardRef(() => UpiIdModule),
    forwardRef(() => Stat1Module),
    forwardRef(() => Stat2Module),
    forwardRef(() => PromoteStatModule),
    forwardRef(() => ChannelsModule),
    forwardRef(() => TgSignupModule),
    forwardRef(() => TimestampModule),
    forwardRef(() => TransactionModule),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
