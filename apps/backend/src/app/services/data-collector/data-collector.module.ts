import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '@/app/services/common/default-jobs-options';
import { PrismaModule } from '@/app/services/prisma/prisma.module';
import { DataCollectorService } from './data-collector.service';
import { ApiCollectorModule } from './api-collector/api-collector.module';
import { RssCollectorModule } from './rss-collector/rss-collector.module';
import { WebCollectorModule } from './web-collector/web-collector.module';
import { WebCollectorService } from './web-collector/web-collector.service';
import { DataCollectorFactory } from './data-collector.factory';
import { RssCollectorService } from './rss-collector/rss-collector.service';
import { ApiCollectorService } from './api-collector/api-collector.service';
import { IDataCollectorService } from './data-collector.interface';
import { DataCollectorFetchProcessor } from './processors/data-collector-fetch.processor';
import { DataCollectorJobProcessor } from './processors/data-collector-job.processor';
import { JOB_ENRICHER_PRODUCER } from '@/app/services/common/flow-producer.constants';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { QueueName } from '../common/queue-name.enum';

@Module({
  imports: [
    PrismaModule,
    ...Object.values(QueueName)
      .flatMap((queue) => [
        BullModule.registerQueue({
          name: queue,
          defaultJobOptions,
        }),
        BullBoardModule.forFeature({
          name: queue,
          adapter: BullMQAdapter,
        }),
      ]),
    BullModule.registerFlowProducer({
      name: JOB_ENRICHER_PRODUCER,
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
    DataCollectorFetchProcessor,
    DataCollectorJobProcessor,
    DataCollectorService,
  ],
  exports: [DataCollectorService],
})
export class DataCollectorModule {
}
