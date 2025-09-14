import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  BuildModule, UsersModule, TelegramModule,
  UserDataModule, ClientModule, ActiveChannelsModule,
  UpiIdModule, Stat1Module, Stat2Module, PromoteStatModule,
  ChannelsModule, PromoteClientModule,
  TransactionModule, LoggerMiddleware,
  DynamicDataModule, AuthGuard,
  BotsModule
} from 'common-tg-service';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    DynamicDataModule,
    BotsModule,
    BuildModule, UsersModule, TelegramModule,
    UserDataModule, ClientModule,
    ActiveChannelsModule, UpiIdModule,
    Stat1Module, Stat2Module, PromoteStatModule,
    ChannelsModule, PromoteClientModule, TransactionModule],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}