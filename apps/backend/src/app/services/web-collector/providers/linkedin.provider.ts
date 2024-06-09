import { Injectable } from '@nestjs/common';
import { WebProvider } from '../web-collector.interface';
import { defaultCrawlerOptions } from '../web-collector.defaults';
import { PlaywrightCrawler, RobotsFile, sleep } from 'crawlee';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class LinkedinWebProvider implements WebProvider {
  readonly _identifier = 'linkedin.com';

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

  searchUrl(options: { searchTerms: string; location?: string; level: string }): string {
    return '';
  }

  handle(): PlaywrightCrawler {
    return new PlaywrightCrawler({
      ...defaultCrawlerOptions,
      requestHandler: async () => {
        // TODO: implement request handler
        await sleep(1000);
      },
    });
  }
}
