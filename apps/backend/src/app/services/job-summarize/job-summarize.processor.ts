import { Processor, WorkerHost } from '@nestjs/bullmq';
import { JOB_SUMMARIZE } from '../common/queue.constants';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobAttributes, JobWithId } from '@/app/services/interfaces/job.interface';
import { JobSummarizeService } from './job-summarize.service';
import Bottleneck from 'bottleneck';
import { IJobListingsEnrichRequest } from '@/app/services/interfaces/queue.interface';

@Processor(JOB_SUMMARIZE)
export class JobsSummarizeProcessor extends WorkerHost {
  readonly _logger = new Logger(JobsSummarizeProcessor.name);

  constructor(
    private readonly _jobSummarizeService: JobSummarizeService,
  ) {
    super();
  }

  async process(job: Job<IJobListingsEnrichRequest>): Promise<boolean> {
    const { collectorConfig } = job.data;

    const candidatesMatchedToJobs = await job.getChildrenValues<(JobWithId & JobAttributes & {
      candidates: number
    })[]>();
    const limiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: 60_000 / 5,
    });
    this._logger.log(`Received ${candidatesMatchedToJobs[`enrich-jobs:${collectorConfig.name}-find-candidates`].length} jobs to summarize`);

    // TODO: Only summarize jobs for which we have Candidates.
    candidatesMatchedToJobs[`enrich-jobs:${collectorConfig.name}-find-candidates`]
      .filter(jobListing => jobListing.description && jobListing.description.trim().length > 0)
      .map(async (jobListing) => {
        this._logger.log(`Summarizing job: ${jobListing.title} based on ${jobListing.candidates} matching candidates`);
        await limiter.schedule({
            id: `job-summarize-${jobListing.id}`,
          },
          () => this._jobSummarizeService.summarizeJob(jobListing));
      });

    return true;
  }

}
