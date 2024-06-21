import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { defaultJobOptions } from '@/app/services/common/default-jobs-options';
import { PrismaModule } from '@/app/services/prisma/prisma.module';
import { CandidateLookupProcessor } from '@/app/services/candidate/candidate-lookup.processor';
import { CandidateService } from '@/app/services/candidate/candidate.service';
import { CANDIDATE_LOOKUP } from '@/app/services/common/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CANDIDATE_LOOKUP,
      defaultJobOptions,
    }),
    PrismaModule,
  ],
  providers: [CandidateService, CandidateLookupProcessor],
  exports: [CandidateService],
})
export class CandidateModule {}
