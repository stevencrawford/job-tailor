import { Module } from '@nestjs/common';
import { HttpBinWebProvider } from './sites/httpbin-io.site';
import { LinkedinWebProvider } from './sites/linkedin.site';
import { Web3CareerWebProvider } from './sites/web3-career.site';
import { JustRemoteWebProvider } from './sites/just-remote.site';
import { ArcDevWebProvider } from './sites/arc-dev.site';
import { WebCollectorService } from './web-collector.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '../../common/default-jobs-options';
import { SiteProvider } from './sites/site-provider.interface';
import { CrawleeProvider } from './providers/crawlee.provider';
import { PlaywrightCrawler } from 'crawlee';
import { IDataProvider } from '../data-provider.interface';
import { SiteProviderFactory } from './sites/site-provider.factory';
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
    ProviderFactory<PlaywrightCrawler>,
    CrawleeProvider,
    SiteProviderFactory,
    {
      provide: 'SITES',
      useFactory: (...providers: SiteProvider[]) => {
        return providers;
      },
      inject: [
        HttpBinWebProvider,
        LinkedinWebProvider,
        Web3CareerWebProvider,
        JustRemoteWebProvider,
        ArcDevWebProvider,
      ],
    },
    {
      provide: 'PROVIDERS',
      useFactory: (...providers: IDataProvider<PlaywrightCrawler>[]) => {
        return providers;
      },
      inject: [
        CrawleeProvider,
      ],
    },
    WebCollectorService,
  ],
  exports: [WebCollectorService]
})
export class WebCollectorModule {}
