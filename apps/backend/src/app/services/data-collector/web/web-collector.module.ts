import { Module } from '@nestjs/common';
import { HttpBinWebProvider } from './providers/httpbin-io.provider';
import { LinkedinWebProvider } from './providers/linkedin.provider';
import { Web3CareerWebProvider } from './providers/web3-career.provider';
import { JustRemoteWebProvider } from './providers/just-remote.provider';
import { ArcDevWebProvider } from './providers/arc-dev.provider';
import { RemoteOkWebProvider } from './providers/remoteok.provider';
import { ProviderFactory } from './provider.factory';
import { WebProvider } from './provider.interface';
import { WebCollectorService } from './web-collector.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '../../common/default-jobs-options';
import { WebCollectorProcessor } from './web-collector.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'data-collector.web.job',
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
    ProviderFactory,
    {
      provide: 'CRAWLER_HANDLERS',
      useFactory: (...handles: WebProvider[]) => {
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
    WebCollectorProcessor,
  ],
  exports: [WebCollectorService]
})
export class WebCollectorModule {}
