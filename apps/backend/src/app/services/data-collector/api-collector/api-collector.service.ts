import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IDataCollectorConfig } from '../data-collector.interface';
import { JobAttributes, JobAttributesRequired } from '@/app/services/interfaces/job.interface';
import { ApiCollectorConfig, apiConfigSchema } from './schema/api-config.schema';
import { UnknownCollectorError, UnsupportedUrlError } from '@/app/services/data-collector/errors/data-collector.error';
import { AxiosApiCrawler } from './axios-api-crawler';
import { ProviderFactory } from '../common/provider.factory';
import { BaseCollectorService } from '../common/base-collector.service';
import ms from 'ms';
import { QueueName } from '@/app/services/common/queue-name.enum';

@Injectable()
export class ApiCollectorService extends BaseCollectorService<AxiosApiCrawler> {
  _type = 'API';

  constructor(
    protected readonly  providerFactory: ProviderFactory<AxiosApiCrawler>,
    @InjectQueue(QueueName.DataCollectorJob) protected readonly dataCollectorJobQueue: Queue<{
      collectorConfig: IDataCollectorConfig,
      jobListings: Array<JobAttributesRequired | JobAttributes>
    }>,
  ) {
    super(providerFactory, dataCollectorJobQueue);
  }

  async fetchData(collectorConfig: IDataCollectorConfig): Promise<number> {
    const config: ApiCollectorConfig = apiConfigSchema.parse(collectorConfig.config);

    const apiProvider = this._providerFactory.get(collectorConfig.name);
    if (!apiProvider) {
      throw new UnknownCollectorError(`Connector "${collectorConfig.name}" is not supported.`);
    }

    if (apiProvider.hasSupport(config.url)) {
      const apiCrawler = apiProvider.initialize(this._bullQueueDispatcher);
      await apiCrawler.run([config.url], {
        lastRun: collectorConfig.lastRun > 0 ? collectorConfig.lastRun : new Date(Date.now() - ms('48 hours')).getTime(),
      });
    } else {
      throw new UnsupportedUrlError(`"${config.url}" not supported by ${apiProvider._identifier}`);
    }

    return Promise.resolve(0);
  }
}
