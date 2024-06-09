import { Injectable } from '@nestjs/common';
import { HandlerConfig } from '../web-collector.interface';
import { PaginatedWebProvider } from './paginated-web.provider';
import { Page } from '@playwright/test';
import { RawJob } from '../../job/job.interface';
import { RobotsFile } from 'crawlee';
import { DATETIME_TRANSFORMER, optionalLocator } from '../utils/playwright.utils';

@Injectable()
export class RemoteOkWebProvider extends PaginatedWebProvider {
  readonly _identifier = 'remoteok.com';
  readonly _config: HandlerConfig = {
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

  searchUrl(options: { searchTerms: string; location?: string; level: string }): string {
    return `https://${this._identifier}/remote-engineer-jobs?location=Worldwide,region_EU&order_by=date`;
  }

  async getListPageContent(page: Page): Promise<Pick<RawJob, 'title' | 'url' | 'timestamp'>[]> {
    const jobRows = await page.locator('tr.job').all();
    return Promise.all(
      jobRows.map(async (row): Promise<Pick<RawJob, 'title' | 'url' | 'timestamp'>> => {
        const link = row.locator('a[itemprop="url"]');
        const title = await row.locator('a[itemprop="url"] > h2').textContent();
        const timestamp = await optionalLocator(row, 'td.time > time', DATETIME_TRANSFORMER);
        return {
          title: title.trim(),
          url: new URL(`https://${this._identifier}${await link.getAttribute('href')}`).toString(),
          timestamp,
        };
      }),
    );
  }

  async getDetailPageContent(page: Page): Promise<Partial<RawJob>> {
    return {
      title: await optionalLocator(page, this._config.selectors.title),
      company: await optionalLocator(page, this._config.selectors.company),
      location: await optionalLocator(page, this._config.selectors.location),
      description: await optionalLocator(page, this._config.selectors.description),
    };
  }
}
