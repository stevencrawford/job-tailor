import { categorizedJobSchema, classifyResponseSchema, summarizeJobSchema } from '../schema/llm-response.schema';
import { z } from 'zod';
import { SupportProviders } from './llm-provider.factory';
import { JobAttributes, JobAttributesRequired, JobSummaryAttributes, JobWithId } from '../../interfaces/job.interface';
import { UserExperienceAttributes } from '../../interfaces/user.interface';

export type Classification = z.infer<typeof classifyResponseSchema>;
export type CategorizedJob = z.infer<typeof categorizedJobSchema>;
export type SummarizedJob = z.infer<typeof summarizeJobSchema>;

export interface LlmProvider {
  identifier: SupportProviders;

  matchJob(experience: UserExperienceAttributes, jobSummary: JobSummaryAttributes): Promise<Classification>;

  categorizeJobs(jobs: (
    JobWithId
    & Pick<JobAttributesRequired, 'title'>)[],
  ): Promise<{ results?: CategorizedJob[] }>;

  summarizeJob(job: Pick<JobAttributes, 'description'>): Promise<SummarizedJob & {
    aiProvider: string
  }>;
}

