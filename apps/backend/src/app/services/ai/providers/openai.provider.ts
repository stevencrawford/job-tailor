import { Injectable } from '@nestjs/common';
import { RawJob } from '../../job/job.interface';
import { ConfigService } from '@nestjs/config';
import { AIProvider, CategorizedJob, Classification } from '../ai-provider.interface';
import { SupportProviders } from '../ai-provider.factory';
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

  async classifyJob(job: RawJob): Promise<RawJob & Classification> {
    // TODO: implement me
    return Promise.reject();
  }

  categorizeJobs(jobs: ({ id: string } & Pick<RawJob, "title" | "url" | "location">)[]): Promise<{
    results?: CategorizedJob[]
  }> {
    // TODO: implement me
    return Promise.reject();
  }

}
