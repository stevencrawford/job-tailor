import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { FlowJob, FlowProducer, Job } from 'bullmq';
import { PrismaService } from '@/app/services/prisma/prisma.service';
import { IDataCollectorConfig } from '../data-collector.interface';
import { v4 as uuidv4 } from 'uuid';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { JobAttributes, JobAttributesRequired, JobWithId } from '@/app/services/interfaces/job.interface';
import { InjectJobEnricher } from '@/app/services/common/job-enricher-producer.decorator';
import { collectAppConfig } from 'next/dist/build/utils';
import { DATA_COLLECTOR_JOB, JOBS_CATEGORIZE, JOBS_ENRICH, JOBS_SUMMARIZE } from '@/app/services/common/queue.constants';

@Processor(DATA_COLLECTOR_JOB, { concurrency: 10 })
export class DataCollectorJobProcessor extends WorkerHost {
  readonly _logger = new Logger(DataCollectorJobProcessor.name);

  constructor(
    @InjectJobEnricher() private _jobEnricherFlowProducer: FlowProducer,
    @InjectRedis() private readonly _redis: Redis,
    private readonly _prismaService: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{
    collectorConfig: IDataCollectorConfig,
    jobListings: Array<JobAttributesRequired | JobAttributes>
  }>): Promise<number | void> {
    return this.processJobWithErrorHandler(job).catch((err) => {
      // TODO: handle errors
    });
  }

  private async processJobWithErrorHandler(
    job: Job<{ collectorConfig: IDataCollectorConfig, jobListings: Array<JobAttributesRequired | JobAttributes> }>,
  ): Promise<number> {
    // eslint-disable-next-line no-useless-catch
    try {
      const result = await this.handleJob(job);
      return result;
    } catch (err) {
      // TODO: Used to handle errors and update collector status

      // Unknown error
      throw err;
    }
  }

  private async handleJob(job: Job<{
    collectorConfig: IDataCollectorConfig,
    jobListings: Array<JobAttributesRequired | JobAttributes>
  }>): Promise<number> {

    const jobsToEnrich: Array<(JobWithId & (JobAttributes | JobAttributesRequired))> = [];
    for (const jobListing of job.data.jobListings) {
      const alreadySeen = await this._redis.sismember(`seen:${job.data.collectorConfig.name}`, jobListing.url) === 1;
      if (!alreadySeen) {
        const updateNonNullData = () => ({
          ...Object.fromEntries(
            Object.entries(jobListing).filter(([_, value]) => value !== null),
          ),
        });

        const saved = await this._prismaService.job.upsert({
          where: {
            id: jobListing['id'] || uuidv4(),  // FIXME: ID will never be populated
          },
          create: {
            title: jobListing.title,
            url: jobListing.url,
            timestamp: jobListing.timestamp,
            company: jobListing.company,
            ...updateNonNullData(),
            source: job.data.collectorConfig.name,
          },
          update: {
            ...updateNonNullData(),
            source: job.data.collectorConfig.name,
          },
        });

        jobsToEnrich.push({
          ...saved,
          timestamp: Number(saved.timestamp),
        });

        this._redis.sadd(`seen:${job.data.collectorConfig.name}`, saved.url);
      }
    }

    if (jobsToEnrich.length > 0) {
      const summarizeJobs: FlowJob = {
        name: `enrich-jobs:${collectAppConfig.name}-summarize`,
        data: { jobListings: jobsToEnrich },
        queueName: JOBS_SUMMARIZE,
        opts: {
          failParentOnFailure: true,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 15_000,
          },
        },
      };

      const categorizeJobs: FlowJob = {
        name: `enrich-jobs:${collectAppConfig.name}-categorize`,
        data: { jobListings: jobsToEnrich },
        queueName: JOBS_CATEGORIZE,
        opts: {
          failParentOnFailure: true,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 15_000,
          },
        },
      };

      await this._jobEnricherFlowProducer.add({
        name: `enrich-jobs:${collectAppConfig.name}`,
        queueName: JOBS_ENRICH,
        children: [categorizeJobs],
        opts: {
          failParentOnFailure: true,
        },
      });
    }

    return 0;
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
