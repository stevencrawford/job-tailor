import { Module } from '@nestjs/common';
import { JobsQueueListener } from './jobs-queue.listener';
import { WebCollectorModule } from '../services/web-collector/web-collector.module';
import { JobModule } from '../services/job/job.module';

@Module({
  imports: [
    WebCollectorModule,
    JobModule,
  ],
  controllers: [JobsQueueListener],
  // providers: [JobsQueueListener],
})
export class EventsModule {}
