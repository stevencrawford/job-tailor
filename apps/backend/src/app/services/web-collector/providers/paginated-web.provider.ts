import { HandlerConfig, JobDispatcher, WebProvider } from '../web-collector.interface';
import { defaultCrawlerOptions } from '../web-collector.defaults';
import { PlaywrightCrawler, RobotsFile } from 'crawlee';
import { RawJob } from '../../job/job.interface';
import { timestampDiff } from '../../../utils/date.utils';
import { Page } from '@playwright/test';
import { Logger } from '@nestjs/common';

export abstract class PaginatedWebProvider implements WebProvider {
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

  abstract searchUrl(options: { jobCategory: string; jobLevel: string; region?: string }): string;

  abstract getListPageContent(page: Page): Promise<Pick<RawJob, 'title' | 'url' | 'timestamp' | 'company'>[]>;

  abstract getDetailPageContent(page: Page): Promise<Partial<RawJob>>;
}
