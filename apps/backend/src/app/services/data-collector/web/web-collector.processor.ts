import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Dictionary } from 'crawlee';
import { PrismaService } from '../../prisma/prisma.service';
import { IDataCollectorConfig } from '../data-collector.interface';
import { v4 as uuidv4 } from 'uuid';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
@Processor('data-collector.web.job', { concurrency: 10 })
export class WebCollectorProcessor extends WorkerHost {
  readonly _logger = new Logger(WebCollectorProcessor.name);

  constructor(
    @InjectRedis() private readonly _redis: Redis,
    private readonly _prismaService: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{ collectorConfig: IDataCollectorConfig, jobListing: Dictionary }>): Promise<any> {
    this._logger.log(`Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}`);

    return this.processJobWithErrorHandler(job).catch((err) => {
      // TODO: handle errors
    });
  }

  private async processJobWithErrorHandler(
    job: Job<{ collectorConfig: IDataCollectorConfig, jobListing: Dictionary }>,
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
    jobListing: Dictionary
  }>): Promise<unknown> {
    const alreadySeen = await this._redis.sismember(`seen:${job.data.collectorConfig.name}`, job.data.jobListing['url']) === 1;
    if (alreadySeen) {
      return Promise.resolve(0);
    }

    const updateNonNullData = () => ({
      ...Object.fromEntries(
        Object.entries(job.data.jobListing).filter(([_, value]) => value !== null),
      ),
    });

    // Persist the job
    await this._prismaService.job.upsert({
      where: {
        id: job.data.jobListing['id'] || uuidv4(),
      },
      create: {
        title: job.data.jobListing['title'],
        url: job.data.jobListing['url'],
        timestamp: job.data.jobListing['timestamp'] as number ?? new Date().getTime(),
        company: job.data.jobListing['company'],
        ...updateNonNullData(),
        source: job.data.collectorConfig.name,
      },
      update: {
        ...updateNonNullData(),
        source: job.data.collectorConfig.name,
      },
    });

    // Track the job
    return this._redis.sadd(`seen:${job.data.collectorConfig.name}`, job.data.jobListing['url']);
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

  @OnWorkerEvent('completed')
  onCompleted(job: Job<any>): void {
    this._logger.log(`Completed job ${job.id}`);
  }
}
