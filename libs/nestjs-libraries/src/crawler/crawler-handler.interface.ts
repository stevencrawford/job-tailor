import { PlaywrightCrawler } from 'crawlee';
import { RawJob } from './crawler-job.interface';

export interface CrawlerHandler {
  _identifier: string;

  supports(url: string): boolean;

  handle(handler: OnJobListener): PlaywrightCrawler;
}

export interface OnJobListener {
  onJob(data: { source: string, job: RawJob }): void;

  onJobs(data: { source: string, jobs: Partial<RawJob>[] }): void;
}
