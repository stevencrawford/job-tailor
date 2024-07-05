import { Injectable } from '@nestjs/common';
import { IDataCollectorConfig } from '@/app/services/data-collector/data-collector.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RssCollectorConfig, rssConfigSchema } from './schema/rss-config.schema';
import { JobAttributes, JobAttributesRequired } from '@/app/services/interfaces/job.interface';
import { UnknownCollectorError, UnsupportedUrlError } from '@/app/services/data-collector/errors/data-collector.error';
import { ProviderFactory } from '@/app/services/data-collector/common/provider.factory';
import { RssParserCrawler } from './rss-parser-crawler';
import { BaseCollectorService } from '@/app/services/data-collector/common/base-collector.service';
import ms from 'ms';
import { QueueName } from '@/app/services/common/queue-name.enum';

@Injectable()
export class RssCollectorService extends BaseCollectorService<RssParserCrawler> {
  _type = 'RSS';

  constructor(
    protected readonly providerFactory: ProviderFactory<RssParserCrawler>,
    @InjectQueue(QueueName.DataCollectorJob) protected readonly dataCollectorJobQueue: Queue<{
      collectorConfig: IDataCollectorConfig,
      jobListings: Array<JobAttributesRequired | JobAttributes>
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

    if (rssProvider.hasSupport(config.url)) {
      const rssCrawler = rssProvider.initialize(this._bullQueueDispatcher);
      await rssCrawler.run(
        config.url,
        {
          lastRun: collectorConfig.lastRun > 0 ? collectorConfig.lastRun : new Date(Date.now() - ms('48 hours')).getTime(),
        });
    } else {
      throw new UnsupportedUrlError(`"${config.url}" not supported by ${rssProvider._identifier}`);
    }

    return Promise.resolve(1);
  }

}
