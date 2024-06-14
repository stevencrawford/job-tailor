import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IDataCollectorConfig, IDataCollectorService, IJobDispatcher } from '../data-collector.interface';
import { JobAttributes, JobAttributesRequired } from '../../interfaces/job.interface';
import { ProviderFactory } from './provider.factory';
import { Logger } from '@nestjs/common';
import { DATA_COLLECTOR_JOB } from '../../common/queue.constants';

export abstract class BaseCollectorService<T> implements IDataCollectorService {
  readonly _logger = new Logger(this.constructor.name);
  readonly _bullQueueDispatcher: IJobDispatcher;

  abstract readonly _type: string;

  protected constructor(
    protected readonly  _providerFactory: ProviderFactory<T>,
    @InjectQueue(DATA_COLLECTOR_JOB) protected readonly _dataCollectorJobQueue: Queue<{
      collectorConfig: IDataCollectorConfig,
      jobListings: Array<JobAttributesRequired | JobAttributes>
    }>,
  ) {
    this._bullQueueDispatcher = {
      dispatch: async (payload: { collectorConfig: IDataCollectorConfig, jobListings: Array<JobAttributesRequired | JobAttributes> }) => {
        // TODO: it might make sense to perform the bull flow producer stuff here.
        // Prisma:Persist
        // Redis:Track
        // Enrich:Categorize
        // Enrich:Summarize
        // Match:Candidates
        await this._dataCollectorJobQueue.add(
          `${payload.collectorConfig.type}-collector-${payload.collectorConfig.name}`,
          {
            collectorConfig: payload.collectorConfig,
            jobListings: payload.jobListings,
          },
        );
      },
    };
  }

  abstract fetchData(collectorConfig: IDataCollectorConfig): Promise<number>;
}
