import { Module } from '@nestjs/common';
import { JobCategorizeService } from './job-categorize.service';
import { LlmModule } from '@/app/services/llm/llm.module';
import { PrismaModule } from '@/app/services/prisma/prisma.module';
import { JobCategorizeProcessor } from './job-categorize.processor';
import { JOBS_CATEGORIZE } from '@/app/services/common/queue.constants';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '@/app/services/common/default-jobs-options';

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
