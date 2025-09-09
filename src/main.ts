import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);


  const configService = app.get(ConfigService);

  const port = configService.get('PORT');

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true, // Nếu frontend dùng cookie/session
  });

  app.setGlobalPrefix('api/v1');

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,

    exceptionFactory: (errors) => {
      const formattedErrors = {};
      errors.forEach((err) => {
        if (!err.constraints) return;
        formattedErrors[err.property] = Object.values(err.constraints);
      });

      return new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: formattedErrors,
      });
    }
  }));


  const config = new DocumentBuilder()
    .setTitle('Social Media API')
    .setVersion('1.0')
    // .addBearerAuth()
    .addCookieAuth('access_token')
    .addServer('http://localhost:8080')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  app.use(cookieParser());

  await app.listen(port);
}
bootstrap();
