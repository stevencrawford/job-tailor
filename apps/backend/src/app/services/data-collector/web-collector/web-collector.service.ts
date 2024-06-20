import { Injectable } from '@nestjs/common';
import { PlaywrightCrawler, Source } from 'crawlee';
import { IDataCollectorConfig } from '../data-collector.interface';
import { UnknownCollectorError, WebCollectorError } from '../errors/data-collector.error';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobAttributes, JobAttributesRequired } from '../../interfaces/job.interface';
import { BaseCollectorService } from '../common/base-collector.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ProviderFactory } from '../common/provider.factory';
import { CrawleeProvider } from './providers/crawlee.provider';
import { DATA_COLLECTOR_JOB } from '../../common/queue.constants';
import ms from 'ms';

@Injectable()
export class WebCollectorService extends BaseCollectorService<PlaywrightCrawler> {
  _type = 'WEB';
  private readonly _crawler: PlaywrightCrawler;

  constructor(
    protected readonly providerFactory: ProviderFactory<PlaywrightCrawler>,
    @InjectQueue(DATA_COLLECTOR_JOB) protected readonly dataCollectorJobQueue: Queue<{
      collectorConfig: IDataCollectorConfig,
      jobListings: Array<JobAttributesRequired | JobAttributes>
    }>,
    private readonly _prismaService: PrismaService,
  ) {
    super(providerFactory, dataCollectorJobQueue);
    this._crawler = this._providerFactory.get(CrawleeProvider.name).initialize(this._bullQueueDispatcher);
  }

  async fetchData(collectorConfig: IDataCollectorConfig): Promise<number> {
    const handler = this._providerFactory.get(CrawleeProvider.name).hasSupport(collectorConfig.config['url']);
    if (!handler) {
      throw new UnknownCollectorError(`Connector "${collectorConfig.name}" is not supported.`);
    }

    // TODO: Build search URLs based on registered users search preferences

    const sources: Source[] = [{
      url: collectorConfig.config['url'],
      label: 'LIST',
      userData: {
        collectorConfig: {
          ...collectorConfig,
          lastRun: collectorConfig.lastRun ?? new Date(ms('48 hours')).getTime(),
        },
      },
    }];

    // 4. Crawl all the URLs for a given connector
    this._logger.log(`[${collectorConfig.name}] Crawling ${sources.length} sources...`);
    await this._crawler.addRequests(sources);

    if (!this._crawler.running) {
      const stats = await this._crawler.run();

      if (stats.requestsFailed > 0) {
        // TODO: implement this better
        throw new WebCollectorError(`Error while crawling ${collectorConfig.name}: ${JSON.stringify(stats)}`);
      }
    }

    return Promise.resolve(1);
  }

}
