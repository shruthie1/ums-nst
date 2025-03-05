import { forwardRef, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  BuildModule, UsersModule, TelegramModule,
  UserDataModule, ClientModule, ActiveChannelsModule,
  UpiIdModule, StatModule, Stat2Module, PromoteStatModule,
  ChannelsModule, TgSignupModule, LoggerMiddleware
} from 'common-tg-service';


@Module({
  imports: [
    forwardRef(() => BuildModule), forwardRef(() => UsersModule), forwardRef(() => TelegramModule),
    forwardRef(() => UserDataModule), forwardRef(() => ClientModule),
    forwardRef(() => ActiveChannelsModule), forwardRef(() => UpiIdModule),
    forwardRef(() => StatModule), forwardRef(() => Stat2Module), forwardRef(() => PromoteStatModule),
    forwardRef(() => ChannelsModule), forwardRef(() => TgSignupModule)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}