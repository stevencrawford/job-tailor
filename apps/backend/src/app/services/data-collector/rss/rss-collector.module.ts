import { Module } from '@nestjs/common';
import { RSSCollectorService } from './rss-collector.service';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '../../common/default-jobs-options';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'data-collector.job',
      defaultJobOptions
    }),
  ],
  providers: [RSSCollectorService],
  exports: [RSSCollectorService],
})
export class RSSCollectorModule {}
