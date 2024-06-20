import { Injectable, Logger } from '@nestjs/common';
import { IJobDispatcher } from '@/app/services/data-collector/data-collector.interface';
import { JobAttributes } from '@/app/services/interfaces/job.interface';
import { IDataProvider } from '@/app/services/data-collector/data-provider.interface';
import { RssParserCrawler } from '@/app/services/data-collector/rss-collector/rss-parser-crawler';
import { getDomain } from '@/app/utils/url.utils';

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

        const jobsToProcess = jobListings.filter((job: JobAttributes) => job.timestamp > options.lastRun);

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
