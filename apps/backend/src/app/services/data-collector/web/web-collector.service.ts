import { Injectable, Logger } from '@nestjs/common';
import { ProviderFactory } from './provider.factory';
import { JobDispatcher } from './provider.interface';
import { Dictionary, Source } from 'crawlee';
import { PrismaService } from '../../prisma/prisma.service';
import { IDataCollectorConfig, IDataCollectorService } from '../data-collector.interface';
import { UnknownCollectorError, WebCollectorError } from '../errors/data-collector.error';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WebCollectorService implements IDataCollectorService {
  readonly _logger = new Logger(WebCollectorService.name);
  readonly _bullQueueDispatcher: JobDispatcher;

  constructor(
    private readonly _crawlerHandlerFactory: ProviderFactory,
    private readonly _prismaService: PrismaService,
    @InjectQueue('data-collector.web.job') private readonly _dataCollectorQueue: Queue<{ collectorConfig: IDataCollectorConfig, jobListing: Dictionary }>,
  ) {
    this._bullQueueDispatcher = {
      dispatch: async (payload: { collectorConfig: IDataCollectorConfig, jobListings: Dictionary[] }) => {
        await this._dataCollectorQueue.addBulk(payload.jobListings.map((jobListing) => {
          return {
            name: `web-collector-${payload.collectorConfig.name}`,
            data: {
              collectorConfig: payload.collectorConfig,
              jobListing,
            },
          };
        }));
      },
    };
  }

  async fetchData(collectorConfig: IDataCollectorConfig): Promise<number> {
    const handler = this._crawlerHandlerFactory.get(collectorConfig.name);
    if (!handler) {
      throw new UnknownCollectorError(`Connector "${collectorConfig.name}" is not supported.`);
    }

    // 2. Find all User.SearchCriteria TODO: filter based on Connector support JobCategories
    const searchCriteria = await this._prismaService.searchCriteria.findMany();

    // 3. Iterate through the searchCriteria and build unique set of urls.
    const uniqueConnectorUrls: Set<string> = new Set(searchCriteria.map(config => {
      const { jobCategory, region, jobLevel } = config;
      return handler.searchUrl({ jobCategory, jobLevel, region });
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
