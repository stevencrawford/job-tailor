import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '@/app/services/common/default-jobs-options';
import { PrismaModule } from '@/app/services/prisma/prisma.module';
import { CandidateLookupProcessor } from '@/app/services/candidate/candidate-lookup.processor';
import { CandidateService } from '@/app/services/candidate/candidate.service';
import { CANDIDATE_LOOKUP } from '@/app/services/common/queue.constants';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CANDIDATE_LOOKUP,
      defaultJobOptions,
    }),
    BullBoardModule.forFeature({
      name: CANDIDATE_LOOKUP,
      adapter: BullMQAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),
    PrismaModule,
  ],
  providers: [CandidateService, CandidateLookupProcessor],
  exports: [CandidateService],
})
export class CandidateModule {}
