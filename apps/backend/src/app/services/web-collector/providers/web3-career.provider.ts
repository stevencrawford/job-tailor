import { Injectable } from '@nestjs/common';
import { HandlerConfig, handlerConfigSchema } from '../web-collector.interface';
import { RawJob } from '../../job/job.interface';
import { DATETIME_TRANSFORMER, optionalLocator } from '../utils/playwright.utils';
import { Page } from '@playwright/test';
import { PaginatedWebProvider } from './paginated-web.provider';
import web3CareerConfigJson from '../config/web3-career.config.json';
import { RobotsFile } from 'crawlee';

@Injectable()
export class Web3CareerWebProvider extends PaginatedWebProvider {
  readonly _identifier = 'web3.career';
  readonly _config: HandlerConfig;

  constructor() {
    super();
    this._config = handlerConfigSchema.parse(web3CareerConfigJson);
    this.initializeRobotsFile();
  }

  async initializeRobotsFile() {
    this._robotsFile = await RobotsFile.find(`https://${this._identifier}/robots.txt`);
  }

  searchUrl(options: { searchTerms: string; location?: string; level: string }): string {
    return `https://${this._identifier}/remote-jobs`;
  }

  async getListPageContent(page: Page): Promise<Pick<RawJob, 'title' | 'url' | 'timestamp'>[]> {
    const jobRows = await page.locator('table > tbody > tr.table_row:not(.border-paid-table)').all();
    return Promise.all(
      jobRows.map(async (row): Promise<Pick<RawJob, 'title' | 'url' | 'timestamp'>> => {
        const link = row.locator('.job-title-mobile > a');
        const timestamp = await optionalLocator(row, 'time', DATETIME_TRANSFORMER);
        return {
          title: (await link.textContent()).trim(),
          url: new URL(`https://${this._identifier}${await link.getAttribute('href')}`).toString(),
          timestamp,
        };
      }),
    );
  }

  async getDetailPageContent(page: Page): Promise<Partial<RawJob>> {
    return {
      company: await optionalLocator(page, this._config.selectors.company),
      compensation: await optionalLocator(page, this._config.selectors.compensation),
      location: await optionalLocator(page, this._config.selectors.location),
      length: await optionalLocator(page, this._config.selectors.length),
      roleType: await optionalLocator(page, this._config.selectors.roleType),
      description: await page.locator(this._config.selectors.description).innerText(),
    };
  }
}
