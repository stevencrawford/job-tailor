import { Injectable } from '@nestjs/common';
import { CrawlerHandlerFactory } from './crawler-handler.factory';
import { BullMqClient } from '@libs/nestjs-libraries/bull-mq-transport/client/bull-mq.client';
import { RawJob } from '@libs/nestjs-libraries/dto/job.dto';
import { OnJobListener } from './crawler-handler.interface';
import { Source } from 'crawlee';

@Injectable()
export class CrawlerService {
  private readonly _bullOnJobListener: OnJobListener;

  constructor(
    private readonly crawlerHandlerFactory: CrawlerHandlerFactory,
    private _bullMqClient: BullMqClient,
  ) {
    this._bullOnJobListener = {
      onJob: (payload: { source: string, job: RawJob }) => {
        this._bullMqClient.emit('raw-job-details', {
          payload,
        });
      },
      onJobs: (payload: { source: string, jobs: Partial<RawJob>[] }) => {
        this._bullMqClient.emit('raw-job-list-filter', {
          payload,
        });
      },
    };
  }

  async crawl(url: string): Promise<void> {
    const crawler = this.crawlerHandlerFactory.handle(url, this._bullOnJobListener);
    if (!crawler) {
      throw new Error(`url ${url} is not supported.`);
    }

    await crawler.addRequests([url]);

    await crawler.run();
  }

  async crawlAll(source: string, urls: string[]): Promise<void> {
    const crawler = this.crawlerHandlerFactory.handle(`https://${source}`, this._bullOnJobListener);
    if (!crawler) {
      throw new Error(`source ${source} is not supported.`);
    }

    await crawler.addRequests(urls.map(url => ({ url, label: 'DETAIL' } as Source)));

    await crawler.run();
  }
}
