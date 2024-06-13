import { Inject, Injectable } from '@nestjs/common';
import { IDataProvider } from '../../data-provider.interface';
import { RssParserCrawler } from '../rss-parser-crawler';

@Injectable()
export class RssProviderFactory {
  constructor(
    @Inject('RSS_PROVIDERS') private readonly providers: IDataProvider<RssParserCrawler>[],
  ) {}

  get(id: string): IDataProvider<RssParserCrawler> {
    for (const provider of this.providers) {
      if (provider._identifier === id) {
        return provider;
      }
    }
  }
}
