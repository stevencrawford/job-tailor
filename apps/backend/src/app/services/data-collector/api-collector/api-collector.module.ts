import { Module } from '@nestjs/common';
import { ApiCollectorService } from './api-collector.service';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '@/app/services/common/default-jobs-options';
import { HimalayasAppApiProvider } from './providers/himalayas-app.provider';
import { RemoteOkApiProvider } from './providers/remoteok.provider';
import { IDataProvider } from '../data-provider.interface';
import { AxiosApiCrawler } from './axios-api-crawler';
import { ProviderFactory } from '@/app/services/data-collector/common/provider.factory';
import { QueueName } from '@/app/services/common/queue-name.enum';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.DataCollectorJob,
      defaultJobOptions
    }),
  ],
  providers: [
    HimalayasAppApiProvider,
    RemoteOkApiProvider,
    ProviderFactory<AxiosApiCrawler>,
    {
      provide: 'PROVIDERS',
      useFactory: (...handles: IDataProvider<AxiosApiCrawler>[]) => {
        return handles;
      },
      inject: [
        HimalayasAppApiProvider,
        RemoteOkApiProvider,
      ],
    },
    ApiCollectorService
  ],
  exports: [ApiCollectorService]
})
export class ApiCollectorModule {}
