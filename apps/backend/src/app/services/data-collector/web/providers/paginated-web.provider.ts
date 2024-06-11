import { JobDispatcher, WebCollectorConfig, WebProvider } from '../provider.interface';
import { defaultCrawlerOptions } from '../provider.defaults';
import { Dictionary, PlaywrightCrawler, RobotsFile } from 'crawlee';
import { RawJob } from '../../../job/job.interface';
import { timestampDiff } from '../../../../utils/date.utils';
import { Page } from '@playwright/test';
import { Logger } from '@nestjs/common';
import { IDataCollectorConfig } from '../../data-collector.interface';

export abstract class PaginatedWebProvider implements WebProvider {
  readonly _logger = new Logger(this.constructor.name);
  protected _robotsFile: RobotsFile;
  protected readonly _config: WebCollectorConfig;

  abstract readonly _identifier: string;

  supports(url: string): boolean {
    const domain = new URL(url).hostname.split('.').slice(-2).join('.').toLowerCase();
    return domain.includes(this._identifier);
  }

  handle(dispatcher: JobDispatcher): PlaywrightCrawler {
    return new PlaywrightCrawler({
      ...defaultCrawlerOptions,
      requestHandler: async ({ request, page, enqueueLinks }) => {
        this._logger.log(`Processing ${request.url}`);
        const collectorConfig = request.userData['collectorConfig'] as IDataCollectorConfig
        if (request.label === 'DETAIL') {
          const job = {
            source: this._identifier,
            ...request.userData['jobListing'],
            url: request.url,
            ...(await this.getDetailPageContent(page)),
          } as RawJob;

          dispatcher.dispatch({
            collectorConfig,
            jobListings: [job],
          });
        } else {
          const jobs = await this.getListPageContent(page);
          const oldestJobTimestamp = jobs.reduce((prev, curr) => {
            return Math.min(prev, curr.timestamp) ? prev : curr.timestamp;
          }, 0);

          const jobsToProcess = jobs.filter((job: Pick<Dictionary, 'url' | 'timestamp'>) => {
            const isAllowed = this._robotsFile.isAllowed(job.url);
            const isStale = timestampDiff(job.timestamp, this._config.staleJobThreshold.unit) > this._config.staleJobThreshold.value;
            return isAllowed && !isStale;
          });

          dispatcher.dispatch({
            collectorConfig,
            jobListings: jobsToProcess,
          });

          if (this._config.paginationSelector &&
            timestampDiff(oldestJobTimestamp, this._config.staleJobThreshold.unit) < this._config.staleJobThreshold.value
            && jobsToProcess.length == jobs.length) {
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

  abstract getListPageContent(page: Page): Promise<Dictionary[]>;

  abstract getDetailPageContent(page: Page): Promise<Dictionary>;
}
