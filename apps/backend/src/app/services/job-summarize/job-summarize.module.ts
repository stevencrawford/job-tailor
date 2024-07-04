import { Module } from '@nestjs/common';
import { JobSummarizeService } from './job-summarize.service';
import { LlmModule } from '../llm/llm.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '@/app/services/common/default-jobs-options';
import { JobsSummarizeProcessor } from './job-summarize.processor';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { QueueName } from '@/app/services/common/queue-name.enum';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.JobSummarize,
      defaultJobOptions,
    }),
    BullBoardModule.forFeature({
      name: QueueName.JobSummarize,
      adapter: BullMQAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),
    PrismaModule,
    LlmModule
  ],
  providers: [JobSummarizeService, JobsSummarizeProcessor],
  exports: [JobSummarizeService],
})
export class JobSummarizeModule {}
