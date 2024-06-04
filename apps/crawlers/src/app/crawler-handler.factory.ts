import { Inject, Injectable } from '@nestjs/common';
import { CrawlerHandler, OnJobListener } from './crawler-handler.interface';
import { PlaywrightCrawler } from 'crawlee';

@Injectable()
export class CrawlerHandlerFactory {
  constructor(
    @Inject('CRAWLER_HANDLERS') private readonly handlers: CrawlerHandler[],
  ) {}

  handle(url: string, listener: OnJobListener): PlaywrightCrawler {
    for (const handler of this.handlers) {
      if (handler.supports(url)) {
        return handler.handle(listener);
      }
    }

    return null;
  }
}
