import { Injectable } from '@nestjs/common';
import { CrawlerHandler } from '../crawler-handler.interface';
import { defaultCrawlerOptions } from '../crawler.defaults';
import { Dataset, PlaywrightCrawler, RobotsFile, sleep } from 'crawlee';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { RawJob } from '../crawler-job.interface';
import { optionalLocator } from '../utils/crawler.utils';
import { asyncFilter } from '../../common/core.utils';
import config from '../config/web3-career.config.json';
import { JOB_TITLE_TRANSFORMER } from '../utils/web3-career.utils';

@Injectable()
export class Web3CareerCrawlerHandler implements CrawlerHandler {
  _identifier = 'web3.career';

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
    return new PlaywrightCrawler({
      ...defaultCrawlerOptions,
      requestHandler: async ({ request, page, enqueueLinks, log }) => {
        const { url } = request;
        if (request.label === 'DETAIL') {
          const item = {
            url,
            source: this._identifier,
            category: 'raw-job',
          } as RawJob;

          item.title = await optionalLocator(page, config.selectors.title, JOB_TITLE_TRANSFORMER);
          item.company = await optionalLocator(page, config.selectors.company);
          item.compensation = await optionalLocator(page, config.selectors.compensation);
          item.location = await optionalLocator(page, config.selectors.location);
          item.length = await optionalLocator(page, config.selectors.length);
          item.roleType = await optionalLocator(page, config.selectors.roleType);
          item.description = await page.locator(config.selectors.description).innerText();

          await Dataset.pushData(item);
          // track in _redis
          await this._redis.sadd(`${this._identifier}:seen`, url);
        } else {
          const links = await page.locator('.job-title-mobile > a').all();
          const hrefs = await Promise.all(
            links.map(async (link) => await link.getAttribute('href'))
          );
          const hrefsToEnqueue = asyncFilter(hrefs, async (href: string) => {
            const isAllowed = this._robotsFile.isAllowed(`https://${this._identifier}${href}`);
            const isSeen = await this._redis.sismember(`${this._identifier}:seen`, `https://${this._identifier}${href}`) === 1;
            return isAllowed && !isSeen;
          });

          // enqueue filtered jobs links
          await enqueueLinks({
            urls: await hrefsToEnqueue,
            label: 'DETAIL',
          });
          // enqueue next page
          await enqueueLinks({
            selector: 'li.next a.page-link',
            label: 'LIST',
          })
        }

        await sleep(3000)
      },
    });
  }
}


