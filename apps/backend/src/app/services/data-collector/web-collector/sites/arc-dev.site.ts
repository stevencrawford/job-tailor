import { Injectable } from '@nestjs/common';
import { Locator, Page } from '@playwright/test';
import { MULTI_TEXT_TRANSFORMER, optionalLocator, TRIM_TRANSFORMER } from '../utils/crawlee.utils';
import { subDays, subHours, subMinutes, subMonths, subSeconds, subWeeks } from 'date-fns';
import { JobAttributes, JobAttributesOptional } from '../../../interfaces/job.interface';
import { WebCollectorConfig, webConfigSchema } from '../schema/web-config.schema';
import { SiteProvider } from './site-provider.interface';
import arcDevConfigJson from '../config/arc-dev.config.json';

@Injectable()
export class ArcDevWebProvider implements SiteProvider {
  readonly _domain = 'arc.dev';
  readonly _supportedUrls = ['/remote-jobs'];

  async getListPageContent(page: Page): Promise<Array<JobAttributes>> {
    const jobRows = await page.locator('div[class*="external-job-list"] >* div[class*="job-card"]').all();
    return Promise.all(
      jobRows.map(async (row): Promise<JobAttributes> => {
        const link = row.locator('a.job-title');
        const title = await optionalLocator(row, 'a.job-title', TRIM_TRANSFORMER);
        const company = await optionalLocator(row, 'a.company-name', TRIM_TRANSFORMER);
        const tags = await optionalLocator(row, 'a.category', MULTI_TEXT_TRANSFORMER(','));
        const timestamp = await optionalLocator(row, 'div.additional-info > span', RELATIVE_DATE_TRANSFORMER);
        return {
          source: this._domain,
          title,
          url: new URL(`https://${this._domain}/${await link.getAttribute('href')}`).toString(),
          company,
          timestamp,
          tags,
        };
      }),
    );
  }

  async getDetailPageContent(page: Page): Promise<JobAttributesOptional> {
    return {
      location: await optionalLocator(page, this.getConfig().selectors.location),
      description: await optionalLocator(page, this.getConfig().selectors.description),
    };
  }

  getConfig(): WebCollectorConfig {
    return webConfigSchema.parse(arcDevConfigJson);
  }

}

// TRANSFORMERS

const RELATIVE_DATE_TRANSFORMER = async (element: Locator): Promise<number> => {
  const relativeDateString = await element.textContent();
  const now = new Date();
  const [value, unit] = relativeDateString.trim().split(' ');
  const numericValue = isNaN(parseInt(value, 10)) ? 1 : parseInt(value, 10);

  if (!unit) {
    return now.getTime();
  }

  switch (unit.toLowerCase()) {
    case 'months' || 'month':
      return subMonths(now, numericValue).getTime();
    case 'weeks' || 'week':
      return subWeeks(now, numericValue).getTime();
    case 'days' || 'day':
      return subDays(now, numericValue).getTime();
    case 'hours' || 'hour':
      return subHours(now, numericValue).getTime();
    case 'minutes' || 'minute':
      return subMinutes(now, numericValue).getTime();
    case 'seconds' || 'second':
      return subSeconds(now, numericValue).getTime();
    default:
      throw new Error('Invalid time unit');
  }
};
