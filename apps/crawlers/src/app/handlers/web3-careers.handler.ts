import { Injectable, Logger } from '@nestjs/common';
import { CrawlerHandler, JobDispatcher } from '../crawler-handler.interface';
import { defaultCrawlerOptions } from '../crawler.defaults';
import { PlaywrightCrawler, RobotsFile, sleep } from 'crawlee';
import { RawJob } from '@libs/nestjs-libraries/dto/job.dto';
import { optionalLocator } from '../utils/playwright.utils';
import config from '../config/web3-career.config.json';
import { TIMESTAMP_TRANSFORMER } from '../utils/web3-career.utils';
import { timestampDiff } from '@libs/nestjs-libraries/utils/date.utils';

@Injectable()
export class Web3CareerCrawlerHandler implements CrawlerHandler {
  readonly _logger = new Logger(Web3CareerCrawlerHandler.name);


  _identifier = 'web3.career';

  private _robotsFile: RobotsFile;

  constructor() {
    this.initializeRobotsFile();
  }

  async initializeRobotsFile() {
    this._robotsFile = await RobotsFile.find(`https://${this._identifier}/robots.txt`);
  }

  supports(url: string): boolean {
    const domain = new URL(url).hostname.split('.').slice(-2).join('.').toLowerCase();
    return domain.includes(this._identifier);
  }

  handle(dispatcher: JobDispatcher): PlaywrightCrawler {
    return new PlaywrightCrawler({
      ...defaultCrawlerOptions,
      requestHandler: async ({ request, page, enqueueLinks, log }) => {
        const { url } = request;
        if (request.label === 'DETAIL') {
          const job = {
            source: this._identifier,
            ...request.userData['job'],
            url,
          } as RawJob;

          // job.title = await optionalLocator(page, config.selectors.title, JOB_TITLE_TRANSFORMER); // don't overwrite job title
          job.company = await optionalLocator(page, config.selectors.company);
          job.compensation = await optionalLocator(page, config.selectors.compensation);
          job.location = await optionalLocator(page, config.selectors.location);
          job.length = await optionalLocator(page, config.selectors.length);
          job.roleType = await optionalLocator(page, config.selectors.roleType);
          job.description = await page.locator(config.selectors.description).innerText();

          dispatcher.dispatch({
            source: this._identifier,
            job,
          });
        } else {
          let oldestJobTimestamp = new Date().getTime();
          const jobRows = await page.locator('table > tbody > tr.table_row:not(.border-paid-table)').all();
          const jobs: Partial<RawJob>[] = await Promise.all(
            jobRows.map(async (row): Promise<Partial<RawJob>> => {
              const link = row.locator('.job-title-mobile > a');
              const timestamp = await optionalLocator(row, 'time', TIMESTAMP_TRANSFORMER);
              oldestJobTimestamp = Math.min(oldestJobTimestamp, timestamp);
              return {
                title: (await link.textContent()).trim(),
                url: `https://${this._identifier}${await link.getAttribute('href')}`,
                timestamp,
              };
            }),
          );

          const jobsToProcess = jobs.filter((job: Partial<RawJob>) => {
            const isAllowed = this._robotsFile.isAllowed(job.url);
            const isStale = timestampDiff(job.timestamp, 'hour') > 24; // TODO: pass this age cutoff in userData
            return isAllowed && !isStale;
          });

          dispatcher.dispatchPartial({
            source: this._identifier,
            jobs: jobsToProcess,
          });

          // Paginate only if:
          // 1. The oldestJobTimestamp job found is less than 24 hours old
          // 2. We found more jobs to process on the current page
          if (timestampDiff(oldestJobTimestamp, 'hour') < 24 && jobsToProcess.length > 0) {
            await enqueueLinks({
              selector: '.page-item.next > a',
              label: 'LIST',
            });
          }
        }

        await sleep(2000);
      },
    });
  }
}


