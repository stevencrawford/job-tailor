import { Injectable } from '@nestjs/common';
import { WebCollectorConfig, webConfigSchema } from '../web-collector.interface';
import { DATETIME_TRANSFORMER, optionalLocator } from '../utils/playwright.utils';
import { Page } from '@playwright/test';
import { PaginatedWebProvider } from './paginated-web.provider';
import web3CareerConfigJson from '../config/web3-career.config.json';
import { RobotsFile } from 'crawlee';
import { JobAttributesOptional, JobAttributesRequired } from '../../../job/job.interface';

@Injectable()
export class Web3CareerWebProvider extends PaginatedWebProvider {
  readonly _identifier = 'web3.career';
  readonly _config: WebCollectorConfig;

  constructor() {
    super();
    this._config = webConfigSchema.parse(web3CareerConfigJson);
    this.initializeRobotsFile();
  }

  async initializeRobotsFile() {
    this._robotsFile = await RobotsFile.find(`https://${this._identifier}/robots.txt`);
  }

  searchUrl(options: { jobCategory: string; jobLevel: string; region?: string }): string {
    return `https://${this._identifier}/remote-jobs`;
  }

  async getListPageContent(page: Page): Promise<JobAttributesRequired[]> {
    const jobRows = await page.locator('table > tbody > tr.table_row:not(.border-paid-table)').all();
    return Promise.all(
      jobRows.map(async (row): Promise<JobAttributesRequired> => {
        const link = row.locator('.job-title-mobile > a');
        const timestamp = await optionalLocator(row, 'time', DATETIME_TRANSFORMER);
        return {
          source: this._identifier,
          title: (await link.textContent()).trim(),
          url: new URL(`https://${this._identifier}${await link.getAttribute('href')}`).toString(),
          company: await optionalLocator(row, 'h3'),
          timestamp,
        };
      }),
    );
  }

  async getDetailPageContent(page: Page): Promise<JobAttributesOptional> {
    return {
      compensation: await optionalLocator(page, this._config.selectors.compensation),
      location: await optionalLocator(page, this._config.selectors.location),
      length: await optionalLocator(page, this._config.selectors.length),
      roleType: await optionalLocator(page, this._config.selectors.roleType),
      description: await page.locator(this._config.selectors.description).innerText(),
    };
  }
}
