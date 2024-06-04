import { PlaywrightCrawler } from 'crawlee';
import { RawJob } from '@libs/nestjs-libraries/dto/job.dto';

export interface CrawlerHandler {
  _identifier: string;

  supports(url: string): boolean;

  handle(handler: OnJobListener): PlaywrightCrawler;
}

export interface OnJobListener {
  onJob(data: { source: string, job: RawJob }): void;

  onJobs(data: { source: string, jobs: Partial<RawJob>[] }): void;
}
