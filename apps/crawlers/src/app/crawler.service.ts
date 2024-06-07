import { Injectable, Logger } from '@nestjs/common';
import { CrawlerHandlerFactory } from './crawler-handler.factory';
import { BullMqClient } from '@libs/nestjs-libraries/bull-mq-transport/client/bull-mq.client';
import { RawJob } from '@libs/nestjs-libraries/dto/job.dto';
import { JobDispatcher } from './crawler-handler.interface';
import { Source } from 'crawlee';
import { ConnectorRepository } from '@libs/nestjs-libraries/database/connectors/connector.repository';

@Injectable()
export class CrawlerService {
  readonly _logger = new Logger(CrawlerService.name);
  readonly _bullQueueDispatcher: JobDispatcher;

  constructor(
    private readonly _crawlerHandlerFactory: CrawlerHandlerFactory,
    private readonly _connectorRepository: ConnectorRepository,
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

    // 2. Find all UserConnectorConfigs with the selector connector
    const connectorConfigs = await this._connectorRepository.findUserConfigsByConnectorName(connector);

    // 3. Build URLs for each User based on the UserConnectorConfigs
    const sources: Source[] = connectorConfigs.map(config => {
      const { searchTerms, location, level } = config;
      const url = handler.searchUrl({ searchTerms, location, level });
      return {
        url,
        label: 'LIST',
        userData: {
          userId: config.user.id,
        },
      };
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
