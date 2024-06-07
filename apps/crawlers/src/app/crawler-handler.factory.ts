import { Inject, Injectable } from '@nestjs/common';
import { CrawlerHandler, JobDispatcher } from './crawler-handler.interface';
import { PlaywrightCrawler } from 'crawlee';

@Injectable()
export class CrawlerHandlerFactory {
  constructor(
    @Inject('CRAWLER_HANDLERS') private readonly handlers: CrawlerHandler[],
  ) {}

  get(id: string): CrawlerHandler {
    for (const handler of this.handlers) {
      if (handler._identifier === id) {
        return handler;
      }
    }
  }

  handle(url: string, listener: JobDispatcher): PlaywrightCrawler {
    for (const handler of this.handlers) {
      if (handler.supports(url)) {
        return handler.handle(listener);
      }
    }

    return null;
  }
}
