import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  BuildModule, UsersModule, TelegramModule,
  UserDataModule, ClientModule, ActiveChannelsModule,
  UpiIdModule, Stat1Module, Stat2Module, PromoteStatModule,
  ChannelsModule, PromoteClientModule,
  TransactionModule, LoggerMiddleware,
  DynamicDataModule
} from 'common-tg-service';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

@Module({
  imports: [
    DynamicDataModule,
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