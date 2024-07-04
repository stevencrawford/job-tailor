import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  IDataCollectorConfig,
  IDataCollectorService,
  IJobDispatcher,
} from '@/app/services/data-collector/data-collector.interface';
import { JobAttributes, JobAttributesRequired } from '@/app/services/interfaces/job.interface';
import { ProviderFactory } from './provider.factory';
import { Logger } from '@nestjs/common';
import { QueueName } from '@/app/services/common/queue-name.enum';

export abstract class BaseCollectorService<T> implements IDataCollectorService {
  readonly _logger = new Logger(this.constructor.name);
  readonly _bullQueueDispatcher: IJobDispatcher;

  abstract readonly _type: string;

  protected constructor(
    protected readonly _providerFactory: ProviderFactory<T>,
    @InjectQueue(QueueName.DataCollectorJob) protected readonly _dataCollectorJobQueue: Queue<{
      collectorConfig: IDataCollectorConfig,
      jobListings: Array<JobAttributesRequired | JobAttributes>
    }>,
  ) {
    this._bullQueueDispatcher = {
      dispatch: async (payload: {
        collectorConfig: IDataCollectorConfig,
        jobListings: Array<JobAttributesRequired | JobAttributes>
      }) => {
        const { collectorConfig, jobListings } = payload;
        this._logger.log(`Dispatching ${jobListings.length} jobs for ${collectorConfig.name}`);

        await this._dataCollectorJobQueue.add(
          `${collectorConfig.type}-collector-${collectorConfig.name}`,
          {
            collectorConfig,
            jobListings,
          },
        );
      },
    };
  }

  abstract fetchData(collectorConfig: IDataCollectorConfig): Promise<number>;
}
