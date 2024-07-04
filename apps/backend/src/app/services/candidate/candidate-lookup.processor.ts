import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CandidateService } from '@/app/services/candidate/candidate.service';
import { IJobListingsEnrichQueueRequest } from '@/app/services/interfaces/queue.interface';
import { QueueName } from '@/app/services/common/queue-name.enum';

@Processor(QueueName.CandidateLookup)
export class CandidateLookupProcessor extends WorkerHost {
  readonly _logger = new Logger(CandidateLookupProcessor.name);

  constructor(
    private readonly _candidateService: CandidateService,
  ) {
    super();
  }

  async process(job: Job<IJobListingsEnrichQueueRequest>) {
    const { jobListings, collectorConfig } = job.data;
    const candidates = await this._candidateService.findUsersWithMatchingJobCategories(jobListings);
    this._logger.debug(`Found ${candidates.length} candidates for ${collectorConfig.name}`);
    return candidates;
  }

}
