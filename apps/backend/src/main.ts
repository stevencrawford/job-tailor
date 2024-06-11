import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Config } from './app/configuration/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService<Config> = app.get(ConfigService);

  app.enableShutdownHooks();

  const port = configService.getOrThrow<number>('port');
  await app.listen(port);
}

bootstrap();
