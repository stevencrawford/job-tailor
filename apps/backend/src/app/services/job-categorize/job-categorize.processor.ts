import { Processor, WorkerHost } from '@nestjs/bullmq';
import { JOBS_CATEGORIZE } from '@/app/services/common/queue.constants';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobAttributesRequired, JobWithId } from '@/app/services/interfaces/job.interface';
import { JobCategorizeService } from './job-categorize.service';
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 60_000 / 5,
});

@Processor(JOBS_CATEGORIZE)
export class JobCategorizeProcessor extends WorkerHost {
  readonly _logger = new Logger(JobCategorizeProcessor.name);

  constructor(
    private readonly _jobCategorizeService: JobCategorizeService,
  ) {
    super();
  }

  async process(job: Job<{ jobListings: Array<JobWithId & Pick<JobAttributesRequired, 'title'>> }>): Promise<boolean> {
    const jobListingChunks = this.chunkArray(job.data.jobListings, 10);

    for (const chunk of jobListingChunks) {
      await limiter.schedule({
          id: `job-categorize-${chunk[0].id}`,
        },
        () => this._jobCategorizeService.categorizeJobs(chunk));
    }
    return true;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
