import { Inject, Injectable } from '@nestjs/common';
import { CrawlerHandler } from './crawler-handler.interface';
import { PlaywrightCrawler } from 'crawlee';

@Injectable()
export class CrawlerHandlerFactory {
  constructor(
    @Inject('CRAWLER_HANDLERS') private readonly handlers: CrawlerHandler[],
  ) {}

  handle(url: string): PlaywrightCrawler {
    for (const handler of this.handlers) {
      if (handler.supports(url)) {
        return handler.handle();
      }
    }

    return null;
  }
}
