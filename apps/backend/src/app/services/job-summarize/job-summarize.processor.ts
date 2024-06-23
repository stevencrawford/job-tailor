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

    const candidatesMatchedToJobs = await job.getChildrenValues<(JobWithId & Pick<JobAttributes, 'description'> & {
      candidates: number
    })[]>()[`enrich-jobs:${collectorConfig.name}-find-candidates`];
    const limiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: 60_000 / 5,
    });

    this._logger.debug(`Found ${candidatesMatchedToJobs.length} candidates for ${collectorConfig.name}`);

    // Find the max number of candidates for any job
    const maxCandidates = Math.max(...candidatesMatchedToJobs.map(jobListings => jobListings.map(jobListing => jobListing.candidates).reduce((a, b) => a + b, 0)));
    // Find the min number of candidates for any job
    const minCandidates = Math.min(...candidatesMatchedToJobs.map(jobListings => jobListings.map(jobListing => jobListing.candidates).reduce((a, b) => a + b, 0)));

    candidatesMatchedToJobs[`enrich-jobs:${collectorConfig.name}-find-candidates`]
      .filter(jobListing => jobListing.description && jobListing.description.trim().length > 0)
      .map(async (jobListing) => {
        // Create a scaled priority which is between 1-10 based on number of candidates
        const priority = Math.round((jobListing.candidates - minCandidates) / (maxCandidates - minCandidates) * 10);
        await limiter.schedule({
            id: `job-summarize-${jobListing.id}`,
            priority,
          },
          () => this._jobSummarizeService.summarizeJob(jobListing));
      });

    return true;
  }

}
