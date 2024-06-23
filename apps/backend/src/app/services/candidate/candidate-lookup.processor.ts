import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CANDIDATE_LOOKUP } from '../common/queue.constants';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CandidateService } from '@/app/services/candidate/candidate.service';
import { IJobListingsEnrichRequest } from '@/app/services/interfaces/queue.interface';

@Processor(CANDIDATE_LOOKUP)
export class CandidateLookupProcessor extends WorkerHost {
  readonly _logger = new Logger(CandidateLookupProcessor.name);

  constructor(
    private readonly _candidateService: CandidateService,
  ) {
    super();
  }

  async process(job: Job<IJobListingsEnrichRequest>) {
    const { jobListings } = job.data;
    return await this._candidateService.findUsersWithMatchingJobCategories(jobListings);
  }

}
