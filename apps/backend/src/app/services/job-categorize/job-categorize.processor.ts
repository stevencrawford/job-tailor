import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobCategorizeService } from './job-categorize.service';
import Bottleneck from 'bottleneck';
import { IJobListingsEnrichQueueRequest } from '@/app/services/interfaces/queue.interface';
import { chunkArray } from '@/app/utils/core.utils';
import { QueueName } from '@/app/services/common/queue-name.enum';

@Processor(QueueName.JobCategorize)
export class JobCategorizeProcessor extends WorkerHost {
  readonly _logger = new Logger(JobCategorizeProcessor.name);

  constructor(
    private readonly _jobCategorizeService: JobCategorizeService,
  ) {
    super();
  }

  async process(job: Job<IJobListingsEnrichQueueRequest>) {
    const { jobListings } = job.data;
    const limiter = new Bottleneck({
      maxConcurrent: 2,
      minTime: 60_000 / 5,
    });

    const jobListingChunks = chunkArray(jobListings, 10);
    for (const chunk of jobListingChunks) {
      await limiter.schedule({
          id: `job-categorize-${chunk[0].id}`,
        },
        () => this._jobCategorizeService.categorizeJobs(chunk));
    }
    return true;
  }

}
