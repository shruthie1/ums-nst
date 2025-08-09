import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import mongoose from 'mongoose';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('NestJS and Express API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addApiKey(
      { type: 'apiKey', name: 'x-api-key', in: 'header' },
      'x-api-key',
    )
    .build();

  interface CustomRequest extends Request { }
  interface CustomResponse extends Response { }
  interface CustomNextFunction extends NextFunction { }

  // ✅ CORS & Preflight Middleware
  app.use((req: CustomRequest, res: CustomResponse, next: CustomNextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, X-API-Key');

    if (req.method === 'OPTIONS') {
      // Handle preflight quickly
      return res.sendStatus(204);
    }

    next();
  });

  // ✅ Nest CORS config (must match middleware)
  app.enableCors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Accept', 'X-API-Key'],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  });

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  document.components ??= {};
  document.components.securitySchemes ??= {};
  document.security = [{ 'x-api-key': [] }];

  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));

  SwaggerModule.setup('apim', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      authAction: {
        'x-api-key': {
          name: 'x-api-key',
          schema: { type: 'apiKey', in: 'header', name: 'x-api-key' },
          value: process.env.API_KEY || 'santoor',
        },
      },
    },
  });

  mongoose.set('debug', true);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (reason, promise) => {
    console.log('Uncaught Exception at:');
    console.error(promise, reason);
  });

  let isShuttingDown = false;
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`${signal} received`);
    console.log('CTS exit Request');
    await app.close();
    process.exit(0);
  };

  process.on('exit', async () => {
    console.log('Application closed');
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received');
    await shutdown('SIGINT');
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received');
    await shutdown('SIGTERM');
  });

  process.on('SIGQUIT', async () => {
    console.log('SIGQUIT received');
    await shutdown('SIGQUIT');
  });

  await app.init();
  await app.listen(process.env.PORT || 9000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
