import { categorizedJobSchema, classifyResponseSchema, summarizeJobSchema } from './schema/llm-response.schema';
import { z } from 'zod';
import { SupportProviders } from './llm-provider.factory';
import { JobAttributes, JobAttributesRequired } from '../job/job.interface';

export type Classification = z.infer<typeof classifyResponseSchema>;
export type CategorizedJob = z.infer<typeof categorizedJobSchema>;
export type SummarizedJob = z.infer<typeof summarizeJobSchema>;

export interface AIProvider {
  identifier: SupportProviders;

  classifyJob(job: JobAttributes): Promise<JobAttributes & Classification>;

  categorizeJobs(jobs: (
    { id: string }
    & Pick<JobAttributesRequired, 'title' | 'url'>)[],
  ): Promise<{ results?: CategorizedJob[] }>;

  summarizeJob(job: Pick<JobAttributes, 'description'>): Promise<SummarizedJob & {
    aiProvider: string
  }>;
}

