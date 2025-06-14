import { NestFactory } from '@nestjs/core';
import mongoose from 'mongoose';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    allowedHeaders: '*',
    methods: '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('NestJS and Express API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  mongoose.set('debug', true);

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (reason, promise) => {
    console.error(promise, reason);
  });

  let isShuttingDown = false;
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`${signal} received`);
    await app.close();
    process.exit(0);
  };

  process.on('exit', async () => {
    console.log('Application closed');
  });

  process.on('SIGINT', async () => {
    await shutdown('SIGINT');
  });

  process.on('SIGTERM', async () => {
    await shutdown('SIGTERM');
  });

  process.on('SIGQUIT', async () => {
    await shutdown('SIGQUIT');
  });

  await app.init();
  await app.listen(process.env.PORT || 9000);
}
bootstrap();
