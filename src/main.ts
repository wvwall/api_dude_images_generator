import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup Swagger BEFORE applying global prefix
  const config = new DocumentBuilder()
    .setTitle('Dude Images Generator API')
    .setDescription('The Dude Images Generator API description')
    .setVersion('1.0')
    .addTag('images')
    .addTag('auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.setGlobalPrefix('api', {
    exclude: ['docs', 'uploads'],
  });

  // Enable CORS with proper configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // ...existing code...
  app.use('/uploads', express.static('uploads'));
  // ...existing code...

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
