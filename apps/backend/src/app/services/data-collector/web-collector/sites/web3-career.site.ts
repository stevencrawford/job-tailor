import { Injectable } from '@nestjs/common';
import { DATETIME_TRANSFORMER, optionalLocator } from '../utils/crawlee.utils';
import { Page } from '@playwright/test';
import web3CareerConfigJson from '../config/web3-career.config.json';
import { JobAttributesOptional, JobAttributesRequired } from '../../../interfaces/job.interface';
import { webConfigSchema } from '../schema/web-config.schema';
import { SiteProvider } from './site-provider.interface';

@Injectable()
export class Web3CareerWebProvider implements SiteProvider {
  readonly _domain = 'web3.career';
  readonly _supportedUrls = ['/remote-jobs'];

  async getListPageContent(page: Page): Promise<JobAttributesRequired[]> {
    const jobRows = await page.locator('table > tbody > tr.table_row:not(.border-paid-table)').all();
    return Promise.all(
      jobRows.map(async (row): Promise<JobAttributesRequired> => {
        const link = row.locator('.job-title-mobile > a');
        const timestamp = await optionalLocator(row, 'time', DATETIME_TRANSFORMER);
        return {
          source: this._domain,
          title: (await link.textContent()).trim(),
          url: new URL(`https://${this._domain}${await link.getAttribute('href')}`).toString(),
          company: await optionalLocator(row, 'h3'),
          timestamp,
        };
      }),
    );
  }

  async getDetailPageContent(page: Page): Promise<JobAttributesOptional> {
    return {
      compensation: await optionalLocator(page, this.getConfig().selectors.compensation),
      location: await optionalLocator(page, this.getConfig().selectors.location),
      length: await optionalLocator(page, this.getConfig().selectors.length),
      roleType: await optionalLocator(page, this.getConfig().selectors.roleType),
      description: await page.locator(this.getConfig().selectors.description).innerText(),
    };
  }

  getConfig() {
    return webConfigSchema.parse(web3CareerConfigJson);
  }

}
