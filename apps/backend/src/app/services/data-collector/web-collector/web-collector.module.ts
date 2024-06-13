import { Module } from '@nestjs/common';
import { HttpBinWebProvider } from './providers/httpbin-io.provider';
import { LinkedinWebProvider } from './providers/linkedin.provider';
import { Web3CareerWebProvider } from './providers/web3-career.provider';
import { JustRemoteWebProvider } from './providers/just-remote.provider';
import { ArcDevWebProvider } from './providers/arc-dev.provider';
import { RemoteOkWebProvider } from './providers/remoteok.provider';
import { WebCollectorService } from './web-collector.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '../../common/default-jobs-options';
import { IDataProvider } from '../data-provider.interface';
import { PlaywrightCrawler } from 'crawlee';
import { ProviderFactory } from '../common/provider.factory';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'data-collector.job',
      defaultJobOptions
    }),
  ],
  providers: [
    HttpBinWebProvider,
    LinkedinWebProvider,
    Web3CareerWebProvider,
    JustRemoteWebProvider,
    ArcDevWebProvider,
    RemoteOkWebProvider,
    ProviderFactory<PlaywrightCrawler>,
    {
      provide: 'PROVIDERS',
      useFactory: (...handles: IDataProvider<PlaywrightCrawler>[]) => {
        return handles;
      },
      inject: [
        HttpBinWebProvider,
        LinkedinWebProvider,
        Web3CareerWebProvider,
        JustRemoteWebProvider,
        ArcDevWebProvider,
        RemoteOkWebProvider,
      ],
    },
    WebCollectorService,
  ],
  exports: [WebCollectorService]
})
export class WebCollectorModule {}
