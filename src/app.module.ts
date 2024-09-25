import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ActiveChannelsModule, BuildModule, ChannelsModule, ClientModule,
  LoggerMiddleware, PromoteStatModule, Stat2Module, StatModule, TelegramModule, TgSignupModule, UpiIdModule,
  UserDataModule, UsersModule
} from 'commonService';

@Module({
  imports: [
    BuildModule, UsersModule, TelegramModule,
    UserDataModule, ClientModule,
    ActiveChannelsModule, UpiIdModule,
    StatModule, Stat2Module, PromoteStatModule,
    ChannelsModule, TgSignupModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}