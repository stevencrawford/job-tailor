import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { BullMqServer } from '@libs/nestjs-libraries/bull-mq-transport/server/bull-mq.server';
import { CrawlerModule } from './crawler.module';

async function bootstrap() {
  const load = await NestFactory.create(CrawlerModule);
  const strategy = load.get(BullMqServer);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(CrawlerModule, {
    strategy,
  });

  await app.listen();
}

bootstrap();
