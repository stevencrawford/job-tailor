import { Injectable } from '@nestjs/common';
import {
  DATETIME_TRANSFORMER,
  MULTI_TEXT_TRANSFORMER,
  optionalLocator,
  TRIM_TRANSFORMER,
} from '../utils/crawlee.utils';
import { Page } from '@playwright/test';
import web3CareerConfigJson from '../config/web3-career.config.json';
import { JobAttributes, JobAttributesOptional } from '@/app/services/interfaces/job.interface';
import { webConfigSchema } from '../schema/web-config.schema';
import { SiteProvider } from './site-provider.interface';

@Injectable()
export class Web3CareerWebProvider implements SiteProvider {
  readonly _domain = 'web3.career';
  readonly _supportedUrls = ['/remote-jobs'];

  async getListPageContent(page: Page): Promise<Array<JobAttributes>> {
    const jobRows = await page.locator('table > tbody > tr.table_row:not(.border-paid-table)').all();
    return Promise.all(
      jobRows.map(async (row): Promise<JobAttributes> => {
        const link = row.locator('.job-title-mobile > a');
        const timestamp = await optionalLocator(row, 'time', DATETIME_TRANSFORMER);
        const tags = await optionalLocator(row,'span[class*="my-badge"]', MULTI_TEXT_TRANSFORMER(','));
        const location = await optionalLocator(row, '.job-location-mobile > a:not([data-turbo-frame="job"]):last-child', TRIM_TRANSFORMER);
        const compensation = await optionalLocator(row, 'p[class*="text-salary"]', TRIM_TRANSFORMER);
        return {
          source: this._domain,
          title: (await link.textContent()).trim(),
          url: new URL(`https://${this._domain}${await link.getAttribute('href')}`).toString(),
          company: await optionalLocator(row, 'h3'),
          timestamp,
          tags,
          location,
          compensation,
        };
      }),
    );
  }

  async getDetailPageContent(page: Page): Promise<JobAttributesOptional> {
    return {
      compensation: await optionalLocator(page, this.getConfig().selectors.compensation),
      location: await optionalLocator(page, this.getConfig().selectors.location),
      roleType: await optionalLocator(page, this.getConfig().selectors.roleType),
      description: await page.locator(this.getConfig().selectors.description).innerText(),
    };
  }

  getConfig() {
    return webConfigSchema.parse(web3CareerConfigJson);
  }

}
