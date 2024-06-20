import { Injectable, Logger } from '@nestjs/common';
import { IJobDispatcher } from '../../data-collector.interface';
import { JobAttributes } from '../../../interfaces/job.interface';
import { IDataProvider } from '../../data-provider.interface';
import { RssParserCrawler } from '../rss-parser-crawler';
import { getDomain } from '../../../../utils/url.utils';
import { diffInUnitOfTime } from '../../../../utils/date.utils';

@Injectable()
export class HimalayasAppRssProvider implements IDataProvider<RssParserCrawler> {
  readonly _logger = new Logger(HimalayasAppRssProvider.name);
  readonly _identifier = 'himalayas.app';

  hasSupport(url: string): boolean {
    const domain = getDomain(url);
    return (domain === this._identifier);
  }

  initialize(dispatcher: IJobDispatcher): RssParserCrawler {
    return new RssParserCrawler({
      customFields: {
        item: ['description', 'category', 'content:encoded', 'himalayasJobs:companyName', 'himalayasJobs:locationRestriction'],
      },
      responseHandler: async (response, options) => {
        const items = response.items;
        const jobListings: JobAttributes[] = items.map((item) => ({
          title: item.title,
          url: item.link,
          timestamp: Date.parse(item.pubDate),
          company: item['himalayasJobs:companyName'],
          location: item['himalayasJobs:locationRestriction'],
          category: item.categories && item.categories.join(', '),
          description: item['content:encoded'],
          source: this._identifier,
        }));

        const jobsToProcess = jobListings.filter((job) =>
          diffInUnitOfTime(job.timestamp, options.lastRun) > 0);

        dispatcher.dispatch({
          collectorConfig: {
            name: this._identifier,
          },
          jobListings: jobsToProcess,
        });
      },
    });
  }
}
