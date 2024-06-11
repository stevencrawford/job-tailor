import { Injectable, Logger } from '@nestjs/common';
import { IDataCollectorConfig, IDataCollectorService } from '../data-collector.interface';
import Parser from 'rss-parser';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RssCollectorConfig, rssConfigSchema } from './rss.interface';

@Injectable()
export class RSSCollectorService implements IDataCollectorService{
  readonly _logger = new Logger(RSSCollectorService.name);

  constructor(
    @InjectQueue('data-collector.rss.job') private readonly _dataCollectorQueue: Queue<any>,
  ) {
  }

  async fetchData(collectorConfig: IDataCollectorConfig): Promise<number> {
    const config: RssCollectorConfig = rssConfigSchema.parse(collectorConfig.config);

    const parser = new Parser();
    const feed = await parser.parseURL(config.url);
    feed.items.forEach(item => {

      this._logger.log(item.title + ':' + item.link)
    });
    return Promise.resolve(1);
  }

}
