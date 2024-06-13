import { Injectable } from '@nestjs/common';
import { defaultCrawlerOptions } from './provider.defaults';
import { PlaywrightCrawler, RobotsFile, sleep } from 'crawlee';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { IDataProvider } from '../../data-provider.interface';

@Injectable()
export class LinkedinWebProvider implements IDataProvider<PlaywrightCrawler> {
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

  fetchUrl(options: { jobCategory: string; jobLevel: string; region?: string }): string {
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
