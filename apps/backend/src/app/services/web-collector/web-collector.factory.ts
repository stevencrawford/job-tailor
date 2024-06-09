import { Inject, Injectable } from '@nestjs/common';
import { WebProvider, JobDispatcher } from './web-collector.interface';
import { PlaywrightCrawler } from 'crawlee';

@Injectable()
export class WebCollectorFactory {
  constructor(
    @Inject('CRAWLER_HANDLERS') private readonly handlers: WebProvider[],
  ) {}

  get(id: string): WebProvider {
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
