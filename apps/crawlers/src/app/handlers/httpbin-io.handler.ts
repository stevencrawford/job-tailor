import { Injectable } from '@nestjs/common';
import { HandlerConfig } from '../crawler-handler.interface';
import { BaseHandler } from './base.handler';
import { Page } from '@playwright/test';
import { RawJob } from '@libs/nestjs-libraries/dto/job.dto';
import { RobotsFile } from 'crawlee';

@Injectable()
export class HttpBinCrawlerHandler extends BaseHandler {
  readonly _identifier = 'httpbin.io';
  readonly _config: HandlerConfig = {
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

  searchUrl(options: { searchTerms: string; location?: string; level: string }): string {
    return `https://${this._identifier}/user-agent`;
  }

  async getListPageContent(page: Page): Promise<Pick<RawJob, 'title' | 'url' | 'timestamp'>[]> {
    // Since this is a demo handler, we can return an empty array
    return [];
  }

  async getDetailPageContent(page: Page): Promise<Partial<RawJob>> {
    // Since this is a demo handler, we can return an empty object
    return {};
  }
}
