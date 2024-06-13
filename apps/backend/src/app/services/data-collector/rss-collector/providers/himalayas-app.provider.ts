import { Injectable } from '@nestjs/common';
import { IJobDispatcher } from '../../data-collector.interface';
import { JobAttributes } from '../../../interfaces/job.interface';
import { IDataProvider } from '../../data-provider.interface';
import { RssParserCrawler } from '../rss-parser-crawler';

@Injectable()
export class HimalayasAppRssProvider implements IDataProvider<RssParserCrawler> {
  readonly _identifier = 'himalayas.app';

  fetchUrl(options: { jobCategory: string; jobLevel: string; region?: string }): string {
    return '';
  }

  supports(url: string): boolean {
    return false;
  }

  handle(dispatcher: IJobDispatcher): RssParserCrawler {
    return new RssParserCrawler({
      customFields: {
        item: ['description', 'category', 'content:encoded', 'himalayasJobs:companyName', 'himalayasJobs:locationRestriction'],
      },
      responseHandler: async (response) => {
        const items = response.items;
        const jobListings: JobAttributes[] = items.map((item) => ({
          title: item.title,
          url: item.link,
          timestamp: Date.parse(item.pubDate),
          company: item['himalayasJobs:companyName'],
          location: item['himalayasJobs:locationRestriction'],
          category: item.categories.join(', '),
          description: item['content:encoded'],
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
