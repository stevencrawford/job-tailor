import { Module } from '@nestjs/common';
import { JobCategorizeService } from './job-categorize.service';
import { LlmModule } from '@/app/services/llm/llm.module';
import { PrismaModule } from '@/app/services/prisma/prisma.module';
import { JobCategorizeProcessor } from './job-categorize.processor';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '@/app/services/common/default-jobs-options';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { QueueName } from '../common/queue-name.enum';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.JobCategorize,
      defaultJobOptions,
    }),
    BullBoardModule.forFeature({
      name: QueueName.JobCategorize,
      adapter: BullMQAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),
    PrismaModule,
    LlmModule
  ],
  providers: [JobCategorizeService, JobCategorizeProcessor],
  exports: [JobCategorizeService],
})
export class JobCategorizeModule {
}
