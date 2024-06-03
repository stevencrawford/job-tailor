import { Injectable } from '@nestjs/common';
import { CrawlerHandler } from '../crawler-handler.interface';
import { defaultCrawlerOptions } from '../crawler.defaults';
import { PlaywrightCrawler, RobotsFile, sleep } from 'crawlee';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class LinkedinCrawlerHandler implements CrawlerHandler {
  _identifier = 'linkedin.com';

  private _robotsFile: RobotsFile;

  constructor(
    @InjectRedis() private readonly _redis: Redis,
  ) {
    this.initializeRobotsFile();
  }

  async initializeRobotsFile() {
    this._robotsFile = await RobotsFile.find(`https://${this._identifier}/robots.txt`);
  }

  supports(url: string): boolean {
    const domain = new URL(url).hostname.split('.').slice(-2).join('.').toLowerCase();
    return domain.includes(this._identifier);
  }

  handle(): PlaywrightCrawler {
    console.log('LinkedinCrawlerHandler.handle()');
    return new PlaywrightCrawler({
      ...defaultCrawlerOptions,
      requestHandler: async ({ request, page, enqueueLinks, log, pushData }) => {
        const { url } = request;
        log.info(`[LinkedinCrawlerHandler] Processing ${url}`);

        await sleep(1000);
      },
    });
  }
}
