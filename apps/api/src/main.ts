import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ApiModule } from './api.module';
import cookieParser from 'cookie-parser';
import { Config } from '@libs/nestjs-libraries/config/config';
import { ValidationPipe } from '@nestjs/common';

process.env.TZ = 'UTC';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule, {
    rawBody: true,
    cors: {
      credentials: true,
      origin: [process.env.FRONTEND_URL]
    }
  });
  const configService: ConfigService<Config> = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }));

  app.use(cookieParser());
  app.enableShutdownHooks();

  const port = configService.getOrThrow<number>('port');
  await app.listen(port);
}

bootstrap();
