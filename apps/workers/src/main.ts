import { NestFactory } from '@nestjs/core';

import { WorkersModule } from './workers.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { BullMqServer } from '@libs/nestjs-libraries/bull-mq-transport/server/bull-mq.server';

async function bootstrap() {
  const load = await NestFactory.create(WorkersModule);
  const strategy = load.get(BullMqServer);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(WorkersModule, {
    strategy,
  });

  await app.listen();
}

bootstrap();
