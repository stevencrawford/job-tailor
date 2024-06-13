import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '../common/default-jobs-options';
import { PrismaModule } from '../prisma/prisma.module';
import { DataCollectorService } from './data-collector.service';
import { DataCollectorFetchProcessor } from './processors/data-collector-fetch.processor';
import { ApiCollectorModule } from './api-collector/api-collector.module';
import { RSSCollectorModule } from './rss-collector/rss-collector.module';
import { WebCollectorModule } from './web-collector/web-collector.module';
import { DataCollectorJobProcessor } from './processors/data-collector-job.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'data-collector.fetch',
      defaultJobOptions,
    }),
    ApiCollectorModule,
    RSSCollectorModule,
    WebCollectorModule,
  ],
  providers: [
    DataCollectorService,
    DataCollectorFetchProcessor,
    DataCollectorJobProcessor
  ],
  exports: [DataCollectorService]
})
export class DataCollectorModule {}
