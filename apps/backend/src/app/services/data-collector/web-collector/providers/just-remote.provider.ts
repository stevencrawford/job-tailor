import { Injectable } from '@nestjs/common';
import { Locator, Page } from '@playwright/test';
import { PaginatedWebProvider } from './paginated-web.provider';
import { WebCollectorConfig, webConfigSchema } from '../web-collector.interface';
import justRemoteConfigJson from '../config/justremote.config.json';
import { RobotsFile } from 'crawlee';
import { optionalLocator, TRIM_TRANSFORMER } from '../utils/playwright.utils';
import { JobAttributesOptional, JobAttributesRequired } from '../../../interfaces/job.interface';

@Injectable()
export class JustRemoteWebProvider extends PaginatedWebProvider {
  readonly _identifier = 'justremote.co';
  readonly _config: WebCollectorConfig;

  constructor() {
    super();
    this._config = webConfigSchema.parse(justRemoteConfigJson);
    this.initializeRobotsFile();
  }

  async initializeRobotsFile() {
    this._robotsFile = await RobotsFile.find(`https://${this._identifier}/robots.txt`);
  }

  searchUrl(options: { jobCategory: string; jobLevel: string; region?: string }): string {
    return `https://${this._identifier}/remote-developer-jobs`;
  }

  async getListPageContent(page: Page): Promise<JobAttributesRequired[]> {
    const jobRows = await page.locator('div[class*="new-job-item__JobInnerWrapper"]').all();
    return Promise.all(
      jobRows.map(async (row): Promise<JobAttributesRequired> => {
        const link = row.locator('a[class*="new-job-item__JobMeta"]');
        const title = await optionalLocator(row, 'h3[class*="new-job-item__JobTitle"]', TRIM_TRANSFORMER);
        const company = await optionalLocator(row, 'div[class*="new-job-item__JobItemCompany"]', TRIM_TRANSFORMER);
        const timestamp = await optionalLocator(row, 'div[class*="new-job-item__JobItemDate"]', DAY_MONTH_TRANSFORMER);
        return {
          source: this._identifier,
          title,
          url: new URL(`https://${this._identifier}/${await link.getAttribute('href')}`).toString(),
          company,
          timestamp,
        };
      }),
    );
  }

  async getDetailPageContent(page: Page): Promise<JobAttributesOptional> {
    return {
      location: await optionalLocator(page, this._config.selectors.location),
      length: await optionalLocator(page, this._config.selectors.length),
      description: await optionalLocator(page, this._config.selectors.description, DESCRIPTION_TRANSFORMER),
    };
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
