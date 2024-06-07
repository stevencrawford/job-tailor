import { CrawlerHandler, HandlerConfig, JobDispatcher } from '../crawler-handler.interface';
import { defaultCrawlerOptions } from '../crawler.defaults';
import { PlaywrightCrawler, RobotsFile } from 'crawlee';
import { RawJob } from '@libs/nestjs-libraries/dto/job.dto';
import { timestampDiff } from '@libs/nestjs-libraries/utils/date.utils';
import { Page } from '@playwright/test';
import { Logger } from '@nestjs/common';

export abstract class BaseHandler implements CrawlerHandler {
  readonly _logger = new Logger(this.constructor.name);
  protected _robotsFile: RobotsFile;
  protected readonly _config: HandlerConfig;

  abstract readonly _identifier: string;

  supports(url: string): boolean {
    const domain = new URL(url).hostname.split('.').slice(-2).join('.').toLowerCase();
    return domain.includes(this._identifier);
  }

  handle(dispatcher: JobDispatcher): PlaywrightCrawler {
    return new PlaywrightCrawler({
      ...defaultCrawlerOptions,
      requestHandler: async ({ request, page, enqueueLinks }) => {
        if (request.label === 'DETAIL') {
          const job = {
            source: this._identifier,
            ...request.userData['job'],
            url: request.url,
            ...(await this.getDetailPageContent(page)),
          } as RawJob;

          dispatcher.dispatch({
            connector: this._identifier,
            job,
          });
        } else {
          const jobs = await this.getListPageContent(page);
          const oldestJobTimestamp = jobs.reduce((prev, curr) => {
            return Math.min(prev, curr.timestamp) ? prev : curr.timestamp;
          }, 0);

          const jobsToProcess = jobs.filter((job: Partial<RawJob>) => {
            const isAllowed = this._robotsFile.isAllowed(job.url);
            const isStale = timestampDiff(job.timestamp, this._config.staleJobThreshold.unit) > this._config.staleJobThreshold.value;
            return isAllowed && !isStale;
          });

          dispatcher.dispatchPartial({
            connector: this._identifier,
            userId: request.userData['userId'],
            jobs: jobsToProcess,
          });

          if (this._config.paginationSelector &&
            timestampDiff(oldestJobTimestamp, this._config.staleJobThreshold.unit) < this._config.staleJobThreshold.value
            && jobsToProcess.length > 0) {
            await enqueueLinks({
              selector: this._config.paginationSelector,
              label: 'LIST',
              userData: {
                ...request.userData,
              },
            });
          }
        }
      },
    });
  }

  abstract searchUrl(options: { searchTerms: string; location?: string; level: string }): string;

  abstract getListPageContent(page: Page): Promise<Pick<RawJob, 'title' | 'url' | 'timestamp'>[]>;

  abstract getDetailPageContent(page: Page): Promise<Partial<RawJob>>;
}
