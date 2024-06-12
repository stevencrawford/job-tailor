import { PlaywrightCrawler } from 'crawlee';
import { z } from 'zod';
import { IDataCollectorConfig } from '../data-collector.interface';
import { JobAttributes, JobAttributesRequired } from '../../job/job.interface';

export interface WebProvider {
  _identifier: string;

  searchUrl(options: {jobCategory: string, jobLevel: string, region?: string }): string;

  supports(url: string): boolean;

  handle(handler: JobDispatcher): PlaywrightCrawler;
}

export interface JobDispatcher {
  dispatch(data: { collectorConfig: IDataCollectorConfig, jobListings: (JobAttributesRequired | JobAttributes)[] }): void;
}

export const webConfigSchema = z.object({
  selectors: z.object({
    title: z.string(),
    company: z.string(),
    location: z.string().optional(),
    length: z.string().optional(),
    description: z.string(),
    compensation: z.string().optional(),
    roleType: z.string().optional(),
  }),
  paginationSelector: z.string().optional(),
  staleJobThreshold: z.object({
    value: z.number(),
    unit: z.enum(['day', 'hour', 'minute', 'second']),
  }),
});

export type WebCollectorConfig = z.infer<typeof webConfigSchema>;
