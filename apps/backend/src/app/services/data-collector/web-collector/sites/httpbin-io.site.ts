import { Injectable } from '@nestjs/common';
import { Page } from '@playwright/test';
import { JobAttributes, JobAttributesOptional, JobAttributesRequired } from '../../../interfaces/job.interface';
import { WebCollectorConfig } from '../schema/web-config.schema';
import { SiteProvider } from './site-provider.interface';

@Injectable()
export class HttpBinWebProvider implements SiteProvider {
  readonly _domain = 'httpbin.io';
  readonly _supportedUrls = ['/user-agent'];

  async getListPageContent(page: Page): Promise<Array<JobAttributes>> {
    // Since this is a demo handler, we can return an empty array
    return [];
  }

  async getDetailPageContent(page: Page): Promise<JobAttributesOptional> {
    // Since this is a demo handler, we can return an empty object
    return {};
  }

  getConfig(): WebCollectorConfig {
    return {
      selectors: {
        title: '',
        description: '',
      },
    };
  }
}
