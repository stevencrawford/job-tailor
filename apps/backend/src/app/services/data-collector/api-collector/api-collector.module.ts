import { Module } from '@nestjs/common';
import { ApiCollectorService } from './api-collector.service';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '../../common/default-jobs-options';
import { HimalayasAppApiProvider } from './providers/himalayas-app.provider';
import { RemoteOkProvider } from './providers/remoteok.provider';
import { IDataProvider } from '../data-provider.interface';
import { AxiosApiCrawler } from './axios-api-crawler';
import { ProviderFactory } from '../common/provider.factory';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'data-collector.job',
      defaultJobOptions
    }),
  ],
  providers: [
    HimalayasAppApiProvider,
    RemoteOkProvider,
    ProviderFactory<AxiosApiCrawler>,
    {
      provide: 'PROVIDERS',
      useFactory: (...handles: IDataProvider<AxiosApiCrawler>[]) => {
        return handles;
      },
      inject: [
        HimalayasAppApiProvider,
        RemoteOkProvider,
      ],
    },
    ApiCollectorService
  ],
  exports: [ApiCollectorService]
})
export class ApiCollectorModule {}
