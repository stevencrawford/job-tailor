import { Injectable } from '@nestjs/common';
import { CrawlerHandlerFactory } from './crawler-handler.factory';

@Injectable()
export class CrawlerService {
  constructor(
    private readonly crawlerHandlerFactory: CrawlerHandlerFactory,
  ) {
  }

  async crawl(url: string): Promise<void> {
    const crawler = this.crawlerHandlerFactory.handle(url);
    if (!crawler) {
      throw new Error(`url ${url} is not supported.`);
    }

    await crawler.addRequests([url]);

    await crawler.run();
  }
}
