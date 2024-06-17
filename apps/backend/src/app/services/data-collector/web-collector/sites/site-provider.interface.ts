import { Page } from '@playwright/test';
import { JobAttributes, JobAttributesOptional } from '../../../interfaces/job.interface';
import { WebCollectorConfig } from '../schema/web-config.schema';

export interface SiteProvider {
  _domain: string;
  _supportedUrls: string[]

  getListPageContent(page: Page): Promise<Array<JobAttributes>>;

  getDetailPageContent(page: Page): Promise<JobAttributesOptional>;

  getConfig(): WebCollectorConfig;
}
