import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '../common/default-jobs-options';
import { PrismaModule } from '../prisma/prisma.module';
import { DataCollectorService } from './data-collector.service';
import { DataCollectorFetchProcessor } from './processors/data-collector-fetch.processor';
import { ApiCollectorModule } from './api-collector/api-collector.module';
import { RssCollectorModule } from './rss-collector/rss-collector.module';
import { WebCollectorModule } from './web-collector/web-collector.module';
import { DataCollectorJobProcessor } from './processors/data-collector-job.processor';
import { WebCollectorService } from './web-collector/web-collector.service';
import { DataCollectorFactory } from './data-collector.factory';
import { RssCollectorService } from './rss-collector/rss-collector.service';
import { ApiCollectorService } from './api-collector/api-collector.service';
import { IDataCollectorService } from './data-collector.interface';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'data-collector.fetch',
      defaultJobOptions,
    }),
    ApiCollectorModule,
    RssCollectorModule,
    WebCollectorModule,
  ],
  providers: [
    DataCollectorFactory,
    {
      provide: 'COLLECTORS',
      useFactory: (...collectors: IDataCollectorService[]) => {
        return collectors;
      },
      inject: [
        WebCollectorService,
        RssCollectorService,
        ApiCollectorService,
      ],
    },
    DataCollectorService,
    DataCollectorFetchProcessor,
    DataCollectorJobProcessor
  ],
  exports: [DataCollectorService]
})
export class DataCollectorModule {}
