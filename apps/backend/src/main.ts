import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Config } from './app/configuration/config';
import { BullMqServer } from '@libs/nestjs-libraries/bull-mq-transport/server/bull-mq.server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const strategy = app.get(BullMqServer);
  const configService: ConfigService<Config> = app.get(ConfigService);

  app.connectMicroservice({ strategy }, { inheritAppConfig: true });

  app.enableShutdownHooks();

  await app.startAllMicroservices();

  const port = configService.getOrThrow<number>('port');
  await app.listen(port);
}

bootstrap();
