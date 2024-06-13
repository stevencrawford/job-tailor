import { Injectable } from '@nestjs/common';
import { PaginatedWebProvider } from './paginated-web.provider';
import { Page } from '@playwright/test';
import { RobotsFile } from 'crawlee';
import { DATETIME_TRANSFORMER, optionalLocator, TRIM_TRANSFORMER } from '../utils/playwright.utils';
import { JobAttributesOptional, JobAttributesRequired } from '../../../interfaces/job.interface';
import { WebCollectorConfig } from '../schema/web-config.schema';

@Injectable()
export class RemoteOkWebProvider extends PaginatedWebProvider {
  readonly _identifier = 'remoteok.com';
  readonly _config: WebCollectorConfig = {
    selectors: {
      title: 'h2[itemprop="title"]',
      location: 'div[class="location"]',
      company: '.company_profile >* h2',
      description: 'div[class="markdown"]',
    },
    staleJobThreshold: {
      value: 7,
      unit: 'day',
    },
  };

  constructor() {
    super();
    this.initializeRobotsFile();
  }

  async initializeRobotsFile() {
    this._robotsFile = await RobotsFile.find(`https://${this._identifier}/robots.txt`);
  }

  fetchUrl(options: { jobCategory: string; jobLevel: string; region?: string }): string {
    return `https://${this._identifier}/remote-engineer-jobs?location=Worldwide,region_EU&order_by=date`;
  }

  async getListPageContent(page: Page): Promise<JobAttributesRequired[]> {
    const jobRows = await page.locator('tr.job').all();
    return Promise.all(
      jobRows.map(async (row): Promise<JobAttributesRequired> => {
        const link = row.locator('a[itemprop="url"]');
        const title = await optionalLocator(row, 'a[itemprop="url"] > h2', TRIM_TRANSFORMER);
        const company = await optionalLocator(row,'span[itemprop="hiringOrganization"] > h3', TRIM_TRANSFORMER);
        const timestamp = await optionalLocator(row, 'td.time > time', DATETIME_TRANSFORMER);
        return {
          source: this._identifier,
          title,
          url: new URL(`https://${this._identifier}${await link.getAttribute('href')}`).toString(),
          company,
          timestamp,
        };
      }),
    );
  }

  async getDetailPageContent(page: Page): Promise<JobAttributesOptional> {
    return {
      location: await optionalLocator(page, this._config.selectors.location),
      description: await optionalLocator(page, this._config.selectors.description),
    };
  }
}
