import { PlaywrightCrawler } from 'crawlee';
import { RawJob } from '@libs/nestjs-libraries/dto/job.dto';

export interface CrawlerHandler {
  _identifier: string;

  supports(url: string): boolean;

  handle(handler: JobDispatcher): PlaywrightCrawler;
}

export interface JobDispatcher {
  dispatch(data: { source: string, job: RawJob }): void;

  dispatchPartial(data: { source: string, jobs: Partial<RawJob>[] }): void;
}
