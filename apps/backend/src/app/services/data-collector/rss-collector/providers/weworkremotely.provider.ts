import { Injectable } from '@nestjs/common';
import { IJobDispatcher } from '../../data-collector.interface';
import { JobAttributes } from '../../../interfaces/job.interface';
import { IDataProvider } from '../../data-provider.interface';
import { RssParserCrawler } from '../rss-parser-crawler';

@Injectable()
export class WeWorkRemotelyProvider implements IDataProvider<RssParserCrawler> {
  readonly _identifier = 'weworkremotely.com';

  fetchUrl(options: { jobCategory: string; jobLevel: string; region?: string }): string {
    return '';
  }

  supports(url: string): boolean {
    return false;
  }

  handle(dispatcher: IJobDispatcher): RssParserCrawler {
    return new RssParserCrawler({
      customFields: {
        item: ['description', 'category', 'type', 'region'],
      },
      responseHandler: async (response) => {
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

        dispatcher.dispatch({
          collectorConfig: {
            name: this._identifier,
          },
          jobListings,
        });
      },
    });
  }
}
