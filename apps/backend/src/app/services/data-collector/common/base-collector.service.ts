import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IDataCollectorConfig, IDataCollectorService, IJobDispatcher } from '../data-collector.interface';
import { JobAttributes, JobAttributesRequired } from '../../interfaces/job.interface';
import { ProviderFactory } from './provider.factory';
import { Logger } from '@nestjs/common';

export abstract class BaseCollectorService<T> implements IDataCollectorService {
  readonly _logger = new Logger(this.constructor.name);
  readonly _bullQueueDispatcher: IJobDispatcher;

  abstract readonly _type: string;

  protected constructor(
    protected readonly  _providerFactory: ProviderFactory<T>,
    @InjectQueue('data-collector.job') protected readonly _dataCollectorJobQueue: Queue<{
      collectorConfig: IDataCollectorConfig,
      jobListing: JobAttributes
    }>,
  ) {
    this._bullQueueDispatcher = {
      dispatch: async (payload: { collectorConfig: IDataCollectorConfig, jobListings: (JobAttributesRequired | JobAttributes)[] }) => {
        await this._dataCollectorJobQueue.addBulk(payload.jobListings
          .map((jobListing) => {
            return {
              name: `${payload.collectorConfig.type}-collector-${payload.collectorConfig.name}`,
              data: {
                collectorConfig: payload.collectorConfig,
                jobListing,
              },
            };
          }));
      },
    };
  }

  abstract fetchData(collectorConfig: IDataCollectorConfig): Promise<number>;
}
