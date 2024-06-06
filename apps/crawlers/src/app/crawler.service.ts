import { Injectable } from '@nestjs/common';
import { CrawlerHandlerFactory } from './crawler-handler.factory';
import { BullMqClient } from '@libs/nestjs-libraries/bull-mq-transport/client/bull-mq.client';
import { RawJob } from '@libs/nestjs-libraries/dto/job.dto';
import { JobDispatcher } from './crawler-handler.interface';
import { Source } from 'crawlee';

@Injectable()
export class CrawlerService {
  private readonly _bullQueueDispatcher: JobDispatcher;

  constructor(
    private readonly crawlerHandlerFactory: CrawlerHandlerFactory,
    private _bullMqClient: BullMqClient,
  ) {
    this._bullQueueDispatcher = {
      dispatch: (payload: { source: string, job: RawJob }) => {
        this._bullMqClient.emit('raw-job-details', {
          payload,
        });
      },
      dispatchPartial: (payload: { source: string, jobs: Partial<RawJob>[] }) => {
        this._bullMqClient.emit('raw-job-list-filter', {
          payload,
        });
      },
    };
  }

  async crawl(url: string): Promise<void> {
    const crawler = this.crawlerHandlerFactory.handle(url, this._bullQueueDispatcher);
    if (!crawler) {
      throw new Error(`url ${url} is not supported.`);
    }

    await crawler.addRequests([url]);

    await crawler.run();
  }

  async crawlAll(source: string, jobs: Partial<RawJob>[]): Promise<void> {
    const crawler = this.crawlerHandlerFactory.handle(`https://${source}`, this._bullQueueDispatcher);
    if (!crawler) {
      throw new Error(`source ${source} is not supported.`);
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
