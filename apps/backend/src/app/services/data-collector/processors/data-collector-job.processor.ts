import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { IDataCollectorConfig } from '../data-collector.interface';
import { v4 as uuidv4 } from 'uuid';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { JobAttributes, JobAttributesRequired } from '../../interfaces/job.interface';

@Injectable()
@Processor('data-collector.job', { concurrency: 10 })
export class DataCollectorJobProcessor extends WorkerHost {
  readonly _logger = new Logger(DataCollectorJobProcessor.name);

  constructor(
    @InjectRedis() private readonly _redis: Redis,
    private readonly _prismaService: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{
    collectorConfig: IDataCollectorConfig,
    jobListings: (JobAttributes | JobAttributesRequired)[]
  }>): Promise<any> {
    return this.processJobWithErrorHandler(job).catch((err) => {
      // TODO: handle errors
    });
  }

  private async processJobWithErrorHandler(
    job: Job<{ collectorConfig: IDataCollectorConfig, jobListings: (JobAttributes | JobAttributesRequired)[] }>,
  ): Promise<unknown> {
    try {
      // Work on job
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
    jobListings: (JobAttributes | JobAttributesRequired)[]
  }>): Promise<unknown> {

    return job.data.jobListings
      .map(async (jobListing) => {
        const alreadySeen = await this._redis.sismember(`seen:${job.data.collectorConfig.name}`, jobListing.url) === 1;
        if (alreadySeen) {
          return;
        }

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

        this._redis.sadd(`seen:${job.data.collectorConfig.name}`, jobListing.url);
        return saved;
      });
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
