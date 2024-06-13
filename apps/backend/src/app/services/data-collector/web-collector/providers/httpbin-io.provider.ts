import { Injectable } from '@nestjs/common';
import { PaginatedWebProvider } from './paginated-web.provider';
import { Page } from '@playwright/test';
import { RobotsFile } from 'crawlee';
import { JobAttributesOptional, JobAttributesRequired } from '../../../interfaces/job.interface';
import { WebCollectorConfig } from '../schema/web-config.schema';

@Injectable()
export class HttpBinWebProvider extends PaginatedWebProvider {
  readonly _identifier = 'httpbin.io';
  readonly _config: WebCollectorConfig = {
    selectors: {
      title: '',
      description: '',
    },
    staleJobThreshold: {
      value: 1,
      unit: 'day',
    },
  };

  constructor() {
    super();
    this.initializeRobotsFile();
  }

  async initializeRobotsFile() {
    this._robotsFile = await RobotsFile.find(`https://${this._identifier}/robots.txt`);
  }

  fetchUrl(options: { jobCategory: string; jobLevel: string; region?: string }): string {
    return `https://${this._identifier}/user-agent`;
  }

  async getListPageContent(page: Page): Promise<JobAttributesRequired[]> {
    // Since this is a demo handler, we can return an empty array
    return [];
  }

  async getDetailPageContent(page: Page): Promise<JobAttributesOptional> {
    // Since this is a demo handler, we can return an empty object
    return {};
  }
}
