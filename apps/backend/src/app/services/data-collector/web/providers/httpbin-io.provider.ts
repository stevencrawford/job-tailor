import { Injectable } from '@nestjs/common';
import { WebCollectorConfig } from '../provider.interface';
import { PaginatedWebProvider } from './paginated-web.provider';
import { Page } from '@playwright/test';
import { RawJob } from '../../../job/job.interface';
import { RobotsFile } from 'crawlee';

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

  searchUrl(options: { jobCategory: string; jobLevel: string; region?: string }): string {
    return `https://${this._identifier}/user-agent`;
  }

  async getListPageContent(page: Page): Promise<Pick<RawJob, 'title' | 'url' | 'timestamp' | 'company'>[]> {
    // Since this is a demo handler, we can return an empty array
    return [];
  }

  async getDetailPageContent(page: Page): Promise<Partial<RawJob>> {
    // Since this is a demo handler, we can return an empty object
    return {};
  }
}
