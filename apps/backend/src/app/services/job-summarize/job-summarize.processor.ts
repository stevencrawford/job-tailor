import { Processor, WorkerHost } from '@nestjs/bullmq';
import { JOBS_SUMMARIZE } from '../common/queue.constants';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobAttributes, JobWithId } from '../interfaces/job.interface';
import { JobSummarizeService } from './job-summarize.service';
import Bottleneck from 'bottleneck';

@Processor(JOBS_SUMMARIZE)
export class JobsSummarizeProcessor extends WorkerHost {
  readonly _logger = new Logger(JobsSummarizeProcessor.name);

  constructor(
    private readonly _jobSummarizeService: JobSummarizeService,
  ) {
    super();
  }

  async process(job: Job<{ jobListings: Array<JobWithId & Pick<JobAttributes, 'description'>> }>): Promise<boolean> {
    const limiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: 60_000 / 5,
    });

    // TODO: Only summarize jobs for which we have an interested User.
    job.data.jobListings
      .filter(jobListing => jobListing.description && jobListing.description.trim().length > 0)
      .map(async (jobListing) => {
        await limiter.schedule({
            id: `job-summarize-${jobListing.id}`,
          },
          () => this._jobSummarizeService.summarizeJob(jobListing));
      });

    return true;
  }

}
