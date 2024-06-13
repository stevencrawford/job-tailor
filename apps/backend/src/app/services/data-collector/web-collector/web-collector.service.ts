import { Injectable } from '@nestjs/common';
import { PlaywrightCrawler, Source } from 'crawlee';
import { IDataCollectorConfig } from '../data-collector.interface';
import { UnknownCollectorError, WebCollectorError } from '../errors/data-collector.error';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobAttributes } from '../../interfaces/job.interface';
import { ProviderFactory } from '../common/provider.factory';
import { BaseCollectorService } from '../common/base-collector.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WebCollectorService extends BaseCollectorService<PlaywrightCrawler> {

  constructor(
    private readonly _prismaService: PrismaService,
    protected readonly  providerFactory: ProviderFactory<PlaywrightCrawler>,
    @InjectQueue('data-collector.job') protected readonly dataCollectorJobQueue: Queue<{
      collectorConfig: IDataCollectorConfig,
      jobListing: JobAttributes
    }>,
  ) {
    super(providerFactory, dataCollectorJobQueue);
  }

  async fetchData(collectorConfig: IDataCollectorConfig): Promise<number> {
    const handler = this._providerFactory.get(collectorConfig.name);
    if (!handler) {
      throw new UnknownCollectorError(`Connector "${collectorConfig.name}" is not supported.`);
    }

    // 2. Find all User.SearchCriteria TODO: filter based on Connector support JobCategories
    const userSearches = await this._prismaService.userSearch.findMany();

    // 3. Iterate through the userSearches and build unique set of urls.
    const uniqueConnectorUrls: Set<string> = new Set(userSearches.map(config => {
      const { jobCategory, region, jobLevel } = config;
      return handler.fetchUrl({ jobCategory, jobLevel, region });
    }));

    const sources: Source[] = [];
    uniqueConnectorUrls.forEach(url => {
      sources.push({
        url,
        label: 'LIST',
        userData: {
          collectorConfig,
        }
      });
    });

    // 4. Crawl all the URLs for a given connector
    const crawler = handler.handle(this._bullQueueDispatcher);
    this._logger.log(`[${collectorConfig.name}] Crawling ${sources.length} sources...`);
    await crawler.addRequests(sources);

    const stats = await crawler.run();

    if (stats.requestsFailed > 0) {
      // TODO: implement this better
      throw new WebCollectorError(`Error while crawling ${collectorConfig.name}: ${stats}`);
    }

    return Promise.resolve(1)
  }

}
