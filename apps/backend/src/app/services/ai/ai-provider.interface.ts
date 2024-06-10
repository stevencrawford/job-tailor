import { RawJob } from '../job/job.interface';
import { categorizedJobSchema, classifyResponseSchema, summarizeJobSchema } from './schema/ai-response.schema';
import { z } from 'zod';
import { SupportProviders } from './ai-provider.factory';

export type Classification = z.infer<typeof classifyResponseSchema>;
export type CategorizedJob = z.infer<typeof categorizedJobSchema>;
export type SummarizedJob = z.infer<typeof summarizeJobSchema>;

export interface AIProvider {
  identifier: SupportProviders;

  classifyJob(job: RawJob): Promise<RawJob & Classification>;

  categorizeJobs(jobs: (
    { id: string }
    & Pick<RawJob, 'title' | 'url' | 'location'>)[],
  ): Promise<{ results?: CategorizedJob[] }>;

  summarizeJob(job: Pick<RawJob, 'description'>): Promise<SummarizedJob & {
    aiProvider: string
  }>;
}

