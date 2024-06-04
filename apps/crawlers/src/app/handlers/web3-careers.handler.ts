import { Injectable } from '@nestjs/common';
import { CrawlerHandler, OnJobListener } from '../crawler-handler.interface';
import { defaultCrawlerOptions } from '../crawler.defaults';
import { PlaywrightCrawler, RobotsFile, sleep } from 'crawlee';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { RawJob } from '@libs/nestjs-libraries/dto/job.dto';
import { optionalLocator } from '../utils/playwright.utils';
import { asyncFilter } from '@libs/nestjs-libraries/utils/core.utils';
import config from '../config/web3-career.config.json';
import { JOB_TITLE_TRANSFORMER, TIMESTAMP_TRANSFORMER } from '../utils/web3-career.utils';
import { timestampDiff } from '@libs/nestjs-libraries/utils/date.utils';

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

  handle(handler: OnJobListener): PlaywrightCrawler {
    return new PlaywrightCrawler({
      ...defaultCrawlerOptions,
      requestHandler: async ({ request, page, log }) => {
        const { url } = request;
        if (request.label === 'DETAIL') {
          const job = {
            // TODO: ...request.userData['job']
            url,
            source: this._identifier,
            category: 'raw-job',
          } as RawJob;

          job.title = await optionalLocator(page, config.selectors.title, JOB_TITLE_TRANSFORMER);
          job.company = await optionalLocator(page, config.selectors.company);
          job.compensation = await optionalLocator(page, config.selectors.compensation);
          job.location = await optionalLocator(page, config.selectors.location);
          job.length = await optionalLocator(page, config.selectors.length);
          job.roleType = await optionalLocator(page, config.selectors.roleType);
          job.description = await page.locator(config.selectors.description).innerText();

          handler.onJob({
            source: this._identifier,
            job
          });
          // track in _redis
          await this._redis.sadd(`${this._identifier}:seen`, url);
        } else {
          const jobRows = await page.locator('table > tbody > tr.table_row:not(.border-paid-table)').all();
          const jobs: Partial<RawJob>[] = await Promise.all(
            jobRows.map(async (row) => {
              const link = row.locator('.job-title-mobile > a')
              return {
                title: (await link.textContent()).trim(),
                url: `https://${this._identifier}${await link.getAttribute('href')}`,
                dateListed: await optionalLocator(row,'time', TIMESTAMP_TRANSFORMER),
              }
            })
          );

          const filteredJobs = asyncFilter(jobs, async (job: Partial<RawJob>) => {
            const isAllowed = this._robotsFile.isAllowed(job.url);
            const isSeen = await this._redis.sismember(`${this._identifier}:seen`, job.url) === 1;
            const isTooOld = timestampDiff(job.timestamp, 'hour') > 3; // TODO: pass this age cutoff in userData
            return isAllowed && !isTooOld && !isSeen;
          });

          handler.onJobs({
            source: this._identifier,
            jobs: await filteredJobs
          });
        }

        await sleep(2000)
      },
    });
  }
}


