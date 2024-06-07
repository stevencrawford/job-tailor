import { Injectable } from '@nestjs/common';
import { RawJob } from '@libs/nestjs-libraries/dto/job.dto';
import { Locator, Page } from '@playwright/test';
import { BaseHandler } from './base.handler';
import { HandlerConfig, handlerConfigSchema } from '../crawler-handler.interface';
import justRemoteConfigJson from '../config/justremote.config.json';
import { RobotsFile } from 'crawlee';
import { optionalLocator } from '../utils/playwright.utils';

@Injectable()
export class JustRemoteCrawlerHandler extends BaseHandler {
  readonly _identifier = 'justremote.co';
  readonly _config: HandlerConfig;

  constructor() {
    super();
    this._config = handlerConfigSchema.parse(justRemoteConfigJson);
    this.initializeRobotsFile();
  }

  async initializeRobotsFile() {
    this._robotsFile = await RobotsFile.find(`https://${this._identifier}/robots.txt`);
  }

  searchUrl(options: { searchTerms: string; location?: string; level: string }): string {
    return `https://${this._identifier}/remote-developer-jobs`;
  }

  async getListPageContent(page: Page): Promise<Pick<RawJob, 'title' | 'url' | 'timestamp'>[]> {
    const jobRows = await page.locator('div[class*="new-job-item__JobInnerWrapper"]').all();
    return Promise.all(
      jobRows.map(async (row): Promise<Pick<RawJob, 'title' | 'url' | 'timestamp'>> => {
        const link = row.locator('a[class*="new-job-item__JobMeta"]');
        const title = await row.locator('h3[class*="new-job-item__JobTitle"]').textContent();
        const timestamp = await optionalLocator(row, 'div[class*="new-job-item__JobItemDate"]', DAY_MONTH_TRANSFORMER);
        return {
          title: title.trim(),
          url: new URL(`https://${this._identifier}/${await link.getAttribute('href')}`).toString(),
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
      length: await optionalLocator(page, this._config.selectors.length),
      description: await optionalLocator(page, this._config.selectors.description, DESCRIPTION_TRANSFORMER),
    };
  }
}

// TRANSFORMERS

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
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
}
