import { Injectable } from '@nestjs/common';
import { RobotsFile } from 'crawlee';
import { SiteProvider } from './site-provider.interface';
import { Page } from '@playwright/test';
import { JobAttributes, JobAttributesOptional } from '@/app/services/interfaces/job.interface';
import { WebCollectorConfig } from '../schema/web-config.schema';

@Injectable()
export class LinkedinWebProvider implements SiteProvider {
  readonly _domain = 'linkedin.com';
  readonly _supportedUrls = [];

  private _robotsFile: RobotsFile;

  constructor(
  ) {
    this.initializeRobotsFile();
  }

  async initializeRobotsFile() {
    this._robotsFile = await RobotsFile.find(`https://${this._domain}/robots.txt`);
  }

  getDetailPageContent(page: Page): Promise<JobAttributesOptional> {
    return Promise.resolve(null);
  }

  getListPageContent(page: Page): Promise<Array<JobAttributes>> {
    return Promise.resolve([]);
  }

  getConfig(): WebCollectorConfig {
    return {};
  }

}
