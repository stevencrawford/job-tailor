import { PlaywrightCrawler } from 'crawlee';
import { RawJob } from '../job/job.interface';
import { z } from 'zod';

export interface WebProvider {
  _identifier: string;

  searchUrl(options: {searchTerms: string, location?: string, level: string }): string;

  supports(url: string): boolean;

  handle(handler: JobDispatcher): PlaywrightCrawler;
}

export interface JobDispatcher {
  dispatch(data: { connector: string, job: RawJob }): void;

  dispatchPartial(data: { connector: string, userId: string, jobs: Partial<RawJob>[] }): void;
}

export const handlerConfigSchema = z.object({
  selectors: z.object({
    title: z.string(),
    company: z.string().optional(),
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

export type HandlerConfig = z.infer<typeof handlerConfigSchema>;
