import { Injectable, Logger } from '@nestjs/common';
import { WebCollectorFactory } from './web-collector.factory';
import { BullMqClient } from '@libs/nestjs-libraries/bull-mq-transport/client/bull-mq.client';
import { RawJob } from '../job/job.interface';
import { JobDispatcher } from './web-collector.interface';
import { Source } from 'crawlee';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebCollectorService {
  readonly _logger = new Logger(WebCollectorService.name);
  readonly _bullQueueDispatcher: JobDispatcher;

  constructor(
    private readonly _crawlerHandlerFactory: WebCollectorFactory,
    private readonly _prismaService: PrismaService,
    private _bullMqClient: BullMqClient,
  ) {
    this._bullQueueDispatcher = {
      dispatch: (payload: { connector: string, job: RawJob }) => {
        this._bullMqClient.emit('raw-job-details', {
          payload,
        });
      },
      dispatchPartial: (payload: { connector: string, userId: string, jobs: Partial<RawJob>[] }) => {
        this._bullMqClient.emit('raw-job-list-filter', {
          payload,
        });
      },
    };
  }

  async crawl(connector: string): Promise<void> {
    // 1. Load the crawler handler based on the connector
    const handler = this._crawlerHandlerFactory.get(connector);
    if (!handler) {
      throw new Error(`Connector "${connector}" is not supported.`);
    }

    // 2. Find all User.SearchCriteria
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
      });
    });

    // 4. Crawl all the URLs for a given connector
    const crawler = handler.handle(this._bullQueueDispatcher);
    this._logger.log(`[${connector}] Crawling ${sources.length} sources...`);
    await crawler.addRequests(sources);

    await crawler.run();
  }

  async crawlAll(connector: string, jobs: Partial<RawJob>[]): Promise<void> {
    const crawler = this._crawlerHandlerFactory.handle(`https://${connector}`, this._bullQueueDispatcher);
    if (!crawler) {
      throw new Error(`source ${connector} is not supported.`);
    }

    await crawler.addRequests(jobs.map(job => ({
      url: job.url,
      label: 'DETAIL',
      userData: {
        job
      }
    } as Source)));

    await crawler.run();
  }

}
