import { Module } from '@nestjs/common';
import { JobSummarizeService } from './job-summarize.service';
import { LlmModule } from '../llm/llm.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { JOB_SUMMARIZE } from '@/app/services/common/queue.constants';
import { defaultJobOptions } from '@/app/services/common/default-jobs-options';
import { JobsSummarizeProcessor } from './job-summarize.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: JOB_SUMMARIZE,
      defaultJobOptions,
    }),
    PrismaModule,
    LlmModule
  ],
  providers: [JobSummarizeService, JobsSummarizeProcessor],
  exports: [JobSummarizeService],
})
export class JobSummarizeModule {}
