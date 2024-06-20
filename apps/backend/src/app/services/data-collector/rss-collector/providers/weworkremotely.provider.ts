import { Injectable, Logger } from '@nestjs/common';
import { IJobDispatcher } from '../../data-collector.interface';
import { JobAttributes } from '../../../interfaces/job.interface';
import { IDataProvider } from '../../data-provider.interface';
import { RssParserCrawler } from '../rss-parser-crawler';
import { getDomain } from '../../../../utils/url.utils';
import { diffInUnitOfTime } from '../../../../utils/date.utils';

@Injectable()
export class WeWorkRemotelyProvider implements IDataProvider<RssParserCrawler> {
  readonly _logger = new Logger(WeWorkRemotelyProvider.name);
  readonly _identifier = 'weworkremotely.com';

  hasSupport(url: string): boolean {
    const domain = getDomain(url);
    return (domain === this._identifier);
  }

  initialize(dispatcher: IJobDispatcher): RssParserCrawler {
    return new RssParserCrawler({
      customFields: {
        item: ['description', 'category', 'type', 'region'],
      },
      responseHandler: async (response, options) => {
        const items = response.items;
        const jobListings: JobAttributes[] = items.map((item) => ({
          title: item.title.split(':').at(1).trim(),
          url: item.link,
          timestamp: Date.parse(item.pubDate),
          company: item.title.split(':').at(0),
          location: item['region'],
          roleType: item['type'],
          description: item['description'],
          category: item['category'],
          source: this._identifier,
        }));

        const jobsToProcess = jobListings.filter((job: JobAttributes) => {
          const isStale = diffInUnitOfTime(job.timestamp, options.lastRun) > 0;
          return !isStale;
        });
        dispatcher.dispatch({
          collectorConfig: {
            name: this._identifier,
          },
          jobListings: jobsToProcess
        });
      },
    });
  }
}
