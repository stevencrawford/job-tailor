import { Module } from '@nestjs/common';
import { RssCollectorService } from './rss-collector.service';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '@/app/services/common/default-jobs-options';
import { IDataProvider } from '../data-provider.interface';
import { HimalayasAppRssProvider } from './providers/himalayas-app.provider';
import { RssParserCrawler } from './rss-parser-crawler';
import { ProviderFactory } from '@/app/services/data-collector/common/provider.factory';
import { WeWorkRemotelyProvider } from './providers/weworkremotely.provider';
import { DATA_COLLECTOR_JOB } from '@/app/services/common/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: DATA_COLLECTOR_JOB,
      defaultJobOptions
    }),
  ],
  providers: [
    HimalayasAppRssProvider,
    WeWorkRemotelyProvider,
    ProviderFactory<RssParserCrawler>,
    {
      provide: 'PROVIDERS',
      useFactory: (...providers: IDataProvider<RssParserCrawler>[]) => {
        return providers;
      },
      inject: [
        HimalayasAppRssProvider,
        WeWorkRemotelyProvider,
      ],
    },
    RssCollectorService
  ],
  exports: [RssCollectorService],
})
export class RssCollectorModule {}
