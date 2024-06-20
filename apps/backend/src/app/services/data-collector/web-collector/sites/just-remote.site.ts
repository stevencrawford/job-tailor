import { Injectable } from '@nestjs/common';
import { Locator, Page } from '@playwright/test';
import justRemoteConfigJson from '../config/justremote.config.json';
import { MULTI_TEXT_TRANSFORMER, optionalLocator, TRIM_TRANSFORMER } from '../utils/crawlee.utils';
import { JobAttributes, JobAttributesOptional } from '@/app/services/interfaces/job.interface';
import { webConfigSchema } from '../schema/web-config.schema';
import { SiteProvider } from './site-provider.interface';

@Injectable()
export class JustRemoteWebProvider implements SiteProvider {
  readonly _domain = 'justremote.co';
  readonly _supportedUrls = ['/remote-developer-jobs'];

  async getListPageContent(page: Page): Promise<Array<JobAttributes>> {
    const jobRows = await page.locator('div[class*="new-job-item__JobInnerWrapper"]').all();
    return Promise.all(
      jobRows.map(async (row): Promise<JobAttributes> => {
        const link = row.locator('a[class*="new-job-item__JobMeta"]');
        const title = await optionalLocator(row, 'h3[class*="new-job-item__JobTitle"]', TRIM_TRANSFORMER);
        const company = await optionalLocator(row, 'div[class*="new-job-item__JobItemCompany"]', TRIM_TRANSFORMER);
        const timestamp = await optionalLocator(row, 'div[class*="new-job-item__JobItemDate"]', DAY_MONTH_TRANSFORMER);
        const tags = await optionalLocator(row, 'a[class*="dynamic-tags__StyledTag"]', MULTI_TEXT_TRANSFORMER(','));
        const roleType = await optionalLocator(row, 'div[class*="new-job-item__Tag"]', TRIM_TRANSFORMER);
        return {
          source: this._domain,
          title,
          url: new URL(`https://${this._domain}/${await link.getAttribute('href')}`).toString(),
          company,
          timestamp,
          tags,
          roleType,
        };
      }),
    );
  }

  async getDetailPageContent(page: Page): Promise<JobAttributesOptional> {
    return {
      location: await optionalLocator(page, this.getConfig().selectors.location),
      description: await optionalLocator(page, this.getConfig().selectors.description, DESCRIPTION_TRANSFORMER),
    };
  }

  getConfig() {
    return webConfigSchema.parse(justRemoteConfigJson);
  }
}

// TRANSFORMERS

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAY_MONTH_TRANSFORMER = async (element: Locator): Promise<number> => {
  const dateString = await element.textContent();
  if (!dateString) {
    return 0;
  }

  const [day, month] = dateString.split(' ');
  const monthIndex = monthNames.indexOf(month);

  if (monthIndex === -1) {
    throw new Error(`Invalid month: ${month}`);
  }

  const currentYear = new Date().getFullYear();
  const parsedDate = new Date(`${currentYear}-${monthIndex + 1}-${day}`);

  return parsedDate.getTime();
};

const DESCRIPTION_TRANSFORMER = async (element: Locator) => {
  const paragraphs = await element.locator('p.md-block-unstyled').allTextContents();
  return paragraphs.join('\n');
};
