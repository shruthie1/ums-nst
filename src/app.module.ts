import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ActiveChannelsModule, BuildModule, ChannelsModule, ClientModule,
  LoggerMiddleware, PromoteStatModule, Stat2Module, StatModule, TelegramModule, UpiIdModule,
  UserDataModule, UsersModule, PromoteClientModule
} from 'commonService';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    BuildModule, UsersModule, TelegramModule,
    UserDataModule, ClientModule,
    ActiveChannelsModule, UpiIdModule,
    StatModule, Stat2Module, PromoteStatModule,
    ChannelsModule, PromoteClientModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}