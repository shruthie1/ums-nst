import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './transaction.schema';
import {
  BuildModule, UsersModule, TelegramModule,
  UserDataModule, ClientModule, ActiveChannelsModule,
  UpiIdModule, StatModule, Stat2Module, PromoteStatModule,
  ChannelsModule, PromoteClientModule,
  TransactionModule, LoggerMiddleware
} from 'common-tg-service';

@Module({
  imports: [
    BuildModule, UsersModule, TelegramModule,
    UserDataModule, ClientModule,
    ActiveChannelsModule, UpiIdModule,
    StatModule, Stat2Module, PromoteStatModule,
    ChannelsModule, PromoteClientModule, TransactionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}