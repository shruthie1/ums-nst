import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActiveChannelsModule, ClientModule, LoggerMiddleware, TelegramModule, UserDataModule, UsersModule } from 'commonService';

@Module({
  imports: [UsersModule, TelegramModule, UserDataModule, ClientModule, ActiveChannelsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}