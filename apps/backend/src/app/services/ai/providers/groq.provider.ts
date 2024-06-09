import { Injectable, Logger } from '@nestjs/common';
import { JobCategory, JobLevel, RawJob } from '../../job/job.interface';
import { ConfigService } from '@nestjs/config';
import { parseJSON } from '../../../utils/json.util';
import { AIProvider, CategorizedJob, Classification } from '../ai-provider.interface';
import Groq from 'groq-sdk';
import { categorizeResponseSchema, CLASSIFIED_TYPE, classifyResponseSchema } from '../schema/ai-response.schema';
import { ASSISTANT_MESSAGE } from '../ai-provider.constants';
import { SupportProviders } from '../ai-provider.factory';

const GROQ_MODEL_LLAMA3_70B = 'llama3-70b-8192';

// const GROQ_MODEL_LLAMA3_70B = 'llama3-70b-8192';

@Injectable()
export class GroqProvider implements AIProvider {
  readonly _logger = new Logger(GroqProvider.name);
  identifier: SupportProviders = 'groq';

  private _groq: Groq;

  constructor(private readonly configService: ConfigService) {
    this._groq = new Groq({
      apiKey: configService.getOrThrow('GROQ_API_KEY'),
    });
  }

  async classifyJob(job: RawJob): Promise<RawJob & Classification> {
    const message = `Return a JSON { "score": number, "decision": "APPLY" | "CONSIDER" | "IGNORE", "reason": string? }.

An example response would be:
{
  "score": 0-10,
  "decision": "APPLY" | "CONSIDER" | "IGNORE",
  "reason": "Not suitable because ..."
}

Rules:
1. The "decision" field: score < 5: IGNORE, 5 <= score < 7: CONSIDER, and score >= 7: APPLY. 
2. When the decision field is not "APPLY" include a "reason" field to explain why I should "CONSIDER" or "IGNORE" the role, otherwise set exclude decision field.

The job specification:
###
${job.description}
###
`;
    const response = await this._groq.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: ASSISTANT_MESSAGE,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      n: 1,
      temperature: 1,
      model: GROQ_MODEL_LLAMA3_70B,
      response_format: {
        type: 'json_object',
      },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error(`Groq was unable to process the request.`);
    }

    const res = parseJSON(content);
    this._logger.log(`Groq produced output: ${JSON.stringify(res)}`);
    return {
      ...job,
      ...classifyResponseSchema.parse(res),
      state: CLASSIFIED_TYPE.CLASSIFIED_FULL as const,
    };
  }

  async categorizeJobs(jobs: ({
    id: string
  } & Pick<RawJob, 'title' | 'url' | 'location'>)[]): Promise<{ results?: CategorizedJob[] }> {
    const message = `Return a JSON array { "results": Array<{"id": string, "title": string, "url": string, "category": string, "level": string } }
An example response would be:
{
  "results": [
    {
      "id": "Job ID passed in",
      "title": "Job Title passed in",
      "url": "Job URL passed in",
      "category": "${JobCategory.ENGINEER}",
      "level": "${JobLevel.MID_SENIOR}",
    }
    ...
  ]
}
Given a list of jobs: ID|TITLE|URL|LOCATION
---
${jobs.map(j => `${j.id}|${j.title}|${j.url}|${j.location}`).join('\n')}}
`;
    const response = await this._groq.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `You are a recruitment advisor who summarizes Job titles into category and level. 
Categories: ${Object.values(JobCategory).join(',')}
Levels: ${Object.values(JobLevel).join(',')}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      n: 1,
      temperature: 1,
      model: GROQ_MODEL_LLAMA3_70B,
      response_format: {
        type: 'json_object',
      },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error(`Groq was unable to process the request.`);
    }

    const res = parseJSON(content);
    this._logger.log(`Groq produced output: ${JSON.stringify(res)}`);
    return categorizeResponseSchema.parse(res);
  }

}
