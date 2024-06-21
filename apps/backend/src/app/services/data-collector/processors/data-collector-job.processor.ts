import { InjectFlowProducer, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { FlowJob, FlowProducer, Job } from 'bullmq';
import { PrismaService } from '@/app/services/prisma/prisma.service';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import {
  CANDIDATE_LOOKUP,
  DATA_COLLECTOR_JOB,
  JOB_CATEGORIZE,
  JOB_ENRICH,
  JOB_ENRICHER_PRODUCER,
  JOB_SUMMARIZE,
} from '@/app/services/common/queue.constants';
import { IDataCollectorConfig } from '@/app/services/data-collector/data-collector.interface';
import { JobAttributes, JobAttributesRequired } from '@/app/services/interfaces/job.interface';

@Processor(DATA_COLLECTOR_JOB, { concurrency: 10 })
export class DataCollectorJobProcessor extends WorkerHost {
  readonly _logger = new Logger(DataCollectorJobProcessor.name);

  constructor(
    @InjectFlowProducer(JOB_ENRICHER_PRODUCER) private _jobEnricherFlowProducer: FlowProducer,
    @InjectRedis() private readonly _redis: Redis,
    private readonly _prismaService: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{
    collectorConfig: IDataCollectorConfig,
    jobListings: Array<JobAttributesRequired | JobAttributes>
  }>) {
    return this.processJobWithErrorHandler(job).catch((err) => {
      // TODO: handle errors
    });
  }

  private async processJobWithErrorHandler(job: Job<{
    collectorConfig: IDataCollectorConfig,
    jobListings: Array<JobAttributesRequired | JobAttributes>
  }>) {
    // eslint-disable-next-line no-useless-catch
    try {
      return await this.handleJob(job);
    } catch (err) {
      // TODO: Used to handle errors and update collector status

      // Unknown error
      throw err;
    }
  }

  private async handleJob(job: Job<{
    collectorConfig: IDataCollectorConfig,
    jobListings: Array<JobAttributesRequired | JobAttributes>
  }>) {
    const { jobListings, collectorConfig } = job.data;

    const jobsToEnrich = await Promise.all(
      jobListings.map(async (jobListing) => {
        const alreadySeen = await this._redis.sismember(`seen:${collectorConfig.name}`, jobListing.url) === 1;
        if (!alreadySeen) {
          const updateNonNullData = () => ({
            ...Object.fromEntries(
              Object.entries(jobListing).filter(([_, value]) => value !== null),
            ),
          });

          let jobId;
          // eslint-disable-next-line prefer-const
          ({ id: jobId } = await this._prismaService.job.create({
            data: {
              title: jobListing.title,
              url: jobListing.url,
              timestamp: jobListing.timestamp,
              company: jobListing.company,
              ...updateNonNullData(),
              source: job.data.collectorConfig.name,
            },
          }));

          await this._redis.sadd(`seen:${collectorConfig.name}`, jobListing.url);

          return {
            id: jobId,
            ...jobListing,
          };
        }
      }),
    );

    if (jobsToEnrich.length == 0) {
      return null;
    }

    // Step 1, Categorize jobs
    const categorizeJobs: FlowJob = {
      name: `enrich-jobs:${collectorConfig.name}-categorize`,
      data: { jobListings: jobsToEnrich },
      queueName: JOB_CATEGORIZE,
      opts: {
        failParentOnFailure: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 15_000,
        },
      },
    };

    // Step 2, Find candidates for jobs
    const findCandidates: FlowJob = {
      name: `enrich-jobs:${collectorConfig.name}-find-candidates`,
      data: { jobListings: jobsToEnrich },
      queueName: CANDIDATE_LOOKUP,
      children: [categorizeJobs],
      opts: {
        failParentOnFailure: true,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 15_000,
        },
      },
    };

    // Step 3, Summarize jobs
    const summarizeJobs: FlowJob = {
      name: `enrich-jobs:${collectorConfig.name}-summarize`,
      data: { jobListings: jobsToEnrich },
      queueName: JOB_SUMMARIZE,
      children: [findCandidates],
      opts: {
        failParentOnFailure: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 15_000,
        },
      },
    };

    // Bring it all together
    const enrichJob: FlowJob = {
      name: `enrich-jobs:${collectorConfig.name}`,
      queueName: JOB_ENRICH,
      children: [summarizeJobs],
      opts: {
        failParentOnFailure: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 15_000,
        },
      },
    };

    const flow = await this._jobEnricherFlowProducer.add(enrichJob);
    return flow;
  }

  @OnWorkerEvent('error')
  onError(err: Error): void {
    this._logger.error('Error in worker');
    console.error(err);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<any>, err: Error): void {
    this._logger.warn(`Failed job ${job.id}: ${err.message}`);
  }

}
