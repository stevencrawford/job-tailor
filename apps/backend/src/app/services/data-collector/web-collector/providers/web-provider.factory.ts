import { Inject, Injectable } from '@nestjs/common';
import { PlaywrightCrawler } from 'crawlee';
import { IJobDispatcher } from '../../data-collector.interface';
import { IDataProvider } from '../../data-provider.interface';

@Injectable()
export class WebProviderFactory {
  constructor(
    @Inject('CRAWLER_HANDLERS') private readonly handlers: IDataProvider<PlaywrightCrawler>[],
  ) {}

  get(id: string): IDataProvider<PlaywrightCrawler> {
    for (const handler of this.handlers) {
      if (handler._identifier === id) {
        return handler;
      }
    }
  }

  handle(url: string, listener: IJobDispatcher): PlaywrightCrawler {
    for (const handler of this.handlers) {
      if (handler.supports(url)) {
        return handler.handle(listener);
      }
    }

    return null;
  }
}
