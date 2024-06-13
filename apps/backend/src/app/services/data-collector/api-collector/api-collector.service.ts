import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IDataCollectorConfig } from '../data-collector.interface';
import { JobAttributes } from '../../interfaces/job.interface';
import { ApiCollectorConfig, apiConfigSchema } from './schema/api-config.schema';
import { UnknownCollectorError } from '../errors/data-collector.error';
import { AxiosApiCrawler } from './axios-api-crawler';
import { ProviderFactory } from '../common/provider.factory';
import { BaseCollectorService } from '../common/base-collector.service';

@Injectable()
export class ApiCollectorService extends BaseCollectorService<AxiosApiCrawler> {
  _identifier = 'API';

  constructor(
    protected readonly  providerFactory: ProviderFactory<AxiosApiCrawler>,
    @InjectQueue('data-collector.job') protected readonly dataCollectorJobQueue: Queue<{
      collectorConfig: IDataCollectorConfig,
      jobListing: JobAttributes
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

    const apiCrawler = apiProvider.handle(this._bullQueueDispatcher);
    await apiCrawler.run([config.url]);

    return Promise.resolve(0);
  }
}
