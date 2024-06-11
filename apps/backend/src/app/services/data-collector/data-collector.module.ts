import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '../common/default-jobs-options';
import { PrismaModule } from '../prisma/prisma.module';
import { DataCollectorService } from './data-collector.service';
import { DataCollectorProcessor } from './data-collector.processor';
import { APICollectorModule } from './api/api-collector.module';
import { RSSCollectorModule } from './rss/rss-collector.module';
import { WebCollectorModule } from './web/web-collector.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'data-collector.fetch',
      defaultJobOptions,
    }),
    APICollectorModule,
    RSSCollectorModule,
    WebCollectorModule,
  ],
  providers: [DataCollectorService, DataCollectorProcessor],
  exports: [DataCollectorService]
})
export class DataCollectorModule {}
