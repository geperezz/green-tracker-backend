import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';

import { AppModule } from './app.module';
import { version } from '../package.json';
import { Config } from './config/config.loader';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config: Config = app.get('CONFIG');

  app.enableCors();
  addSwaggerSupport(app);

  await app.listen(config.APP_PORT);
}
bootstrap();

function addSwaggerSupport(app: INestApplication): void {
  patchNestJsSwagger();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GreenTracker')
    .setDescription('The GreenTracker API documentation')
    .setVersion(version)
    .build();
  const openApiDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, openApiDocument);
}
