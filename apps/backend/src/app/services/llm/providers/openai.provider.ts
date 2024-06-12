import { Injectable } from '@nestjs/common';
import { JobAttributes, JobAttributesRequired } from '../../job/job.interface';
import { ConfigService } from '@nestjs/config';
import { AIProvider, CategorizedJob, Classification, SummarizedJob } from '../llm-provider.interface';
import { SupportProviders } from '../llm-provider.factory';
import OpenAI from 'openai';

@Injectable()
export class OpenAIProvider implements AIProvider {
  identifier: SupportProviders = 'openai';

  private _openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this._openai = new OpenAI({
      apiKey: configService.getOrThrow('OPENAI_API_KEY'),
    });
  }

  async classifyJob(job: JobAttributes): Promise<JobAttributes & Classification> {
    // TODO: implement me
    return Promise.reject();
  }

  categorizeJobs(jobs: ({ id: string } & Pick<JobAttributesRequired, 'title' | 'url'>)[]): Promise<{
    results?: CategorizedJob[]
  }> {
    // TODO: implement me
    return Promise.reject();
  }

  summarizeJob(job: { id: string } & Pick<JobAttributes, 'description'>): Promise<{ jobId: string } & SummarizedJob & {
    aiProvider: string
  }> {
    // TODO: implement me
    return Promise.reject();
  }

}
