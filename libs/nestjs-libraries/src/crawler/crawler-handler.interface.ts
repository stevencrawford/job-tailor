import { PlaywrightCrawler } from 'crawlee';

export interface CrawlerHandler {
  _identifier: string;

  supports(url: string): boolean;

  handle(): PlaywrightCrawler;
}
