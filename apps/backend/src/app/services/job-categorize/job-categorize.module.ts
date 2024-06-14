import { Module } from '@nestjs/common';
import { JobCategorizeService } from './job-categorize.service';
import { LlmModule } from '../llm/llm.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JobCategorizeProcessor } from './job-categorize.processor';
import { JOBS_CATEGORIZE } from '../common/queue.constants';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '../common/default-jobs-options';

@Module({
  imports: [
    BullModule.registerQueue({
      name: JOBS_CATEGORIZE,
      defaultJobOptions,
    }),
    PrismaModule,
    LlmModule
  ],
  providers: [JobCategorizeService, JobCategorizeProcessor],
  exports: [JobCategorizeService],
})
export class JobCategorizeModule {
}
