import { defaultCrawlerOptions } from '../config/crawlee.defaults';
import { PlaywrightCrawler, RobotsFile } from 'crawlee';
import { diffInUnitOfTime } from '@/app/utils/date.utils';
import { Injectable, Logger } from '@nestjs/common';
import { IDataCollectorConfig, IJobDispatcher } from '@/app/services/data-collector/data-collector.interface';
import { JobAttributes, JobAttributesRequired } from '@/app/services/interfaces/job.interface';
import { IDataProvider } from '@/app/services/data-collector/data-provider.interface';
import { SiteProviderFactory } from '../sites/site-provider.factory';

@Injectable()
export class CrawleeProvider implements IDataProvider<PlaywrightCrawler> {
  readonly _logger = new Logger(CrawleeProvider.name);

  readonly _identifier = CrawleeProvider.name;

  constructor(
    private readonly _siteProviderFactory: SiteProviderFactory
  ) {}

  hasSupport(url: string): boolean {
    const siteProvider = this._siteProviderFactory.get(url);
    return !!siteProvider;
  }

  initialize(dispatcher: IJobDispatcher): PlaywrightCrawler {
    return new PlaywrightCrawler({
      ...defaultCrawlerOptions,
      requestHandler: async ({ request, page, enqueueLinks }) => {
        this._logger.log(`Processing ${request.url}`);
        const siteProvider = this._siteProviderFactory.get(request.url);
        if (!siteProvider) {
          throw new Error(`No site provider found for context path: ${request.url}`);
        }
        const collectorConfig = request.userData['collectorConfig'] as IDataCollectorConfig;
        const siteConfig = siteProvider.getConfig();

        if (request.label === 'DETAIL') {
          const job = {
            source: siteProvider._domain,
            ...request.userData['jobListing'],
            url: request.url,
            ...(await siteProvider.getDetailPageContent(page)),
          } as JobAttributes;

          dispatcher.dispatch({
            collectorConfig,
            jobListings: [job],
          });
        } else {
          const jobs = await siteProvider.getListPageContent(page);
          const oldestJobTimestamp = jobs.reduce((prev, curr) => {
            return Math.min(prev, curr.timestamp) ? prev : curr.timestamp;
          }, 0);

          const robotsTxt = await RobotsFile.find(`https://${siteProvider._domain}/robots.txt`);
          const jobsToProcess = jobs.filter((job: Pick<JobAttributesRequired, 'url' | 'timestamp'>) => {
            const isAllowed = robotsTxt.isAllowed(job.url);
            const isStale = diffInUnitOfTime(job.timestamp, collectorConfig.lastRun) > 0;
            return isAllowed && !isStale;
          });

          dispatcher.dispatch({
            collectorConfig,
            jobListings: jobsToProcess,
          });

          if (siteConfig.paginationSelector &&
            diffInUnitOfTime(oldestJobTimestamp, collectorConfig.lastRun) > 0
            && jobsToProcess.length == jobs.length) {
            await enqueueLinks({
              selector: siteConfig.paginationSelector,
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
}
