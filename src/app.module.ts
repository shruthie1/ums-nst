import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  BuildModule, UsersModule, TelegramModule,
  UserDataModule, ClientModule, ActiveChannelsModule,
  UpiIdModule, Stat1Module, Stat2Module, PromoteStatModule,
  ChannelsModule, PromoteClientModule,
  TransactionModule, LoggerMiddleware
} from 'common-tg-service';

@Module({
  imports: [
    BuildModule, UsersModule, TelegramModule,
    UserDataModule, ClientModule,
    ActiveChannelsModule, UpiIdModule,
    Stat1Module, Stat2Module, PromoteStatModule,
    ChannelsModule, PromoteClientModule, TransactionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}