import { Injectable } from '@nestjs/common';
import { JobAttributes, JobAttributesRequired, JobSummaryAttributes } from '../../interfaces/job.interface';
import { ConfigService } from '@nestjs/config';
import { LlmProvider, CategorizedJob, Classification, SummarizedJob } from './llm-provider.interface';
import { SupportProviders } from './llm-provider.factory';
import OpenAI from 'openai';
import { UserExperienceAttributes } from '../../interfaces/user.interface';

@Injectable()
export class OpenAIProvider implements LlmProvider {
  identifier: SupportProviders = 'openai';

  private _openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this._openai = new OpenAI({
      apiKey: configService.getOrThrow('OPENAI_API_KEY'),
    });
  }

  async matchJob(experience: UserExperienceAttributes, jobSummary: JobSummaryAttributes): Promise<JobAttributes & Classification> {
    // TODO: implement me
    return Promise.reject();
  }

  async categorizeJobs(jobs: ({ id: string } & Pick<JobAttributesRequired, 'title'>)[]): Promise<{
    results?: CategorizedJob[]
  }> {
    // TODO: implement me
    return Promise.reject();
  }

  async summarizeJob(job: Pick<JobAttributes, 'description'>): Promise<SummarizedJob & { aiProvider: string }> {
    // TODO: implement me
    return Promise.reject();
  }

}
