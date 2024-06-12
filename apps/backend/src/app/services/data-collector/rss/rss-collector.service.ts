import { Injectable, Logger } from '@nestjs/common';
import { IDataCollectorConfig, IDataCollectorService } from '../data-collector.interface';
import Parser from 'rss-parser';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RssCollectorConfig, rssConfigSchema } from './rss-collector.interface';
import { JobAttributes } from '../../job/job.interface';

@Injectable()
export class RSSCollectorService implements IDataCollectorService{
  readonly _logger = new Logger(RSSCollectorService.name);

  constructor(
    @InjectQueue('data-collector.job') private readonly _dataCollectorJobQueue: Queue<{ collectorConfig: IDataCollectorConfig, jobListing: JobAttributes}>,
  ) {
  }

  async fetchData(collectorConfig: IDataCollectorConfig): Promise<number> {
    const config: RssCollectorConfig = rssConfigSchema.parse(collectorConfig.config);

    const parser = new Parser({
      customFields: {
        item: ['description', 'type', 'category', 'region'],
      }
    });
    const feed = await parser.parseURL(config.url);

    await this._dataCollectorJobQueue.addBulk(feed.items.map((item) => {
      return {
        name: `rss-collector-${collectorConfig.name}`,
        data: {
          collectorConfig,
          jobListing: {
            title: item.title.split(':').at(1).trim(),
            url: item.link,
            timestamp: Date.parse(item.pubDate),
            company: item.title.split(':').at(0),
            location: item.region,
            roleType: item.type,
            description: item.description,
            category: item.category,
            source: collectorConfig.name,
          },
        },
      };
    }));

    return Promise.resolve(1);
  }

}
