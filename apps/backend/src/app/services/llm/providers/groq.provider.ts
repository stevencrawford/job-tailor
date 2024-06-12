import { Injectable, Logger } from '@nestjs/common';
import { JobAttributes, JobAttributesRequired, JobCategory, JobLevel } from '../../interfaces/job.interface';
import { ConfigService } from '@nestjs/config';
import { parseJSON } from '../../../utils/json.util';
import { AIProvider, CategorizedJob, Classification, SummarizedJob } from '../llm-provider.interface';
import Groq from 'groq-sdk';
import {
  categorizeResponseSchema,
  CLASSIFIED_TYPE,
  classifyResponseSchema,
  summarizeJobSchema,
} from '../schema/llm-response.schema';
import { ASSISTANT_MESSAGE } from '../llm-provider.constants';
import { SupportProviders } from '../llm-provider.factory';

const GROQ_MODEL_LLAMA3_70B = 'llama3-70b-8192';
const GROQ_MODEL_LLAMA3_8B = 'llama3-8b-8192';

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

  async classifyJob(job: JobAttributes): Promise<JobAttributes & Classification> {
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
  } & Pick<JobAttributesRequired, 'title' | 'url'>)[]): Promise<{ results?: CategorizedJob[] }> {
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
Your choices for category and level are (Only use these values):
Categories: [${Object.values(JobCategory).join(',')}]
Levels: [${Object.values(JobLevel).join(',')}]

List of jobs: ID|TITLE|URL
---
${jobs.map(j => `${j.id}|${j.title}|${j.url}`).join('\n')}}
`;
    const response = await this._groq.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `You summarize job titles into category and level.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      n: 1,
      temperature: 0.2,
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

  async summarizeJob(job: Pick<JobAttributes, 'description'>): Promise<SummarizedJob & { aiProvider: string }> {
    const message = `Return a JSON { "responsibilities": string, "experienceRequirements": string, "technicalStack": string, "interviewProcess": string }
Job Description:
---
${job.description}
`;
    const response = await this._groq.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `Given a complete job description, extract the relevant information. Each field has max length of 500 characters so summarize when necessary.
Rules:
technicalStack: If the job is not technical leave blank. Otherwise pick out at most 8 keys skills/technologies based on importance.
interviewProcess: If the job does not state an interview process leave blank. Otherwise, summarize the process.
`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      n: 1,
      temperature: 0.8,
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
      aiProvider: this.identifier,
      ...summarizeJobSchema.parse(res),
    };
  }

}
