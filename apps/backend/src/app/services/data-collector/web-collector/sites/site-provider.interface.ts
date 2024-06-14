import { Page } from '@playwright/test';
import { JobAttributes, JobAttributesOptional, JobAttributesRequired } from '../../../interfaces/job.interface';
import { WebCollectorConfig } from '../schema/web-config.schema';

export interface SiteProvider {
  _domain: string;
  _supportedUrls: string[]

  getListPageContent(page: Page): Promise<Array<JobAttributesRequired | JobAttributes>>;

  getDetailPageContent(page: Page): Promise<JobAttributesOptional>;

  getConfig(): WebCollectorConfig;
}
