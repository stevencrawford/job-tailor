import { Injectable } from '@nestjs/common';
import { IDataCollectorConfig } from '../data-collector.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RssCollectorConfig, rssConfigSchema } from './schema/rss-config.schema';
import { JobAttributes } from '../../interfaces/job.interface';
import { UnknownCollectorError } from '../errors/data-collector.error';
import { ProviderFactory } from '../common/provider.factory';
import { RssParserCrawler } from './rss-parser-crawler';
import { BaseCollectorService } from '../common/base-collector.service';

@Injectable()
export class RssCollectorService extends BaseCollectorService<RssParserCrawler> {
  _identifier = 'RSS';

  constructor(
    protected readonly providerFactory: ProviderFactory<RssParserCrawler>,
    @InjectQueue('data-collector.job') protected readonly dataCollectorJobQueue: Queue<{
      collectorConfig: IDataCollectorConfig,
      jobListing: JobAttributes
    }>,
  ) {
    super(providerFactory, dataCollectorJobQueue);
  }

  async fetchData(collectorConfig: IDataCollectorConfig): Promise<number> {
    const config: RssCollectorConfig = rssConfigSchema.parse(collectorConfig.config);

    const rssProvider = this._providerFactory.get(collectorConfig.name);

    if (!rssProvider) {
      throw new UnknownCollectorError(`Connector "${collectorConfig.name}" is not supported.`);
    }

    const rssCrawler = rssProvider.handle(this._bullQueueDispatcher);
    await rssCrawler.run(config.url);

    return Promise.resolve(1);
  }

}
