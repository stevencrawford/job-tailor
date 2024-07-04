import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobAttributes, JobWithId } from '@/app/services/interfaces/job.interface';
import { JobSummarizeService } from './job-summarize.service';
import { IJobListingsEnrichQueueRequest } from '@/app/services/interfaces/queue.interface';
import { partialKeyMatcher } from '@/app/utils/bull.utils';
import { QueueName } from '@/app/services/common/queue-name.enum';

@Processor(QueueName.JobSummarize)
export class JobsSummarizeProcessor extends WorkerHost {
  readonly _logger = new Logger(JobsSummarizeProcessor.name);

  constructor(
    private readonly _jobSummarizeService: JobSummarizeService,
  ) {
    super();
  }

  async process(job: Job<IJobListingsEnrichQueueRequest>): Promise<boolean> {
    const { collectorConfig } = job.data;

    const childResults = await job.getChildrenValues<(JobWithId & Pick<JobAttributes, 'description'> & {
      candidates: number
    })[]>();
    const candidates = childResults[partialKeyMatcher(childResults, QueueName.CandidateLookup)];
    this._logger.debug(`Found ${candidates.length} candidates for ${collectorConfig.name}`);

    await this._jobSummarizeService.summarizeBulk(candidates);

    return true;
  }

}
