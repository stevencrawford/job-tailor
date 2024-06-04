import { RawJob } from '../crawler/crawler-job.interface';
import { classifyResponseSchema, rankResponseSchema } from './schema/ai-response.schema';
import { z } from 'zod';
import { SupportProviders } from './ai-provider.factory';

export type Classification = z.infer<typeof classifyResponseSchema>;
export type RankedJobs = z.infer<typeof rankResponseSchema>;

export interface AIProvider {
  identifier: SupportProviders;

  classifyJob(job: RawJob): Promise<RawJob & Classification>;

  rankJobTitles(jobs: Partial<RawJob>[]): Promise<RankedJobs>;
}

