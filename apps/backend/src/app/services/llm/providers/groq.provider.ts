import { Injectable, Logger } from '@nestjs/common';
import {
  JobAttributes,
  JobAttributesRequired,
  JobCategory,
  JobLevel,
  JobSummaryAttributes,
} from '../../interfaces/job.interface';
import { ConfigService } from '@nestjs/config';
import { parseJSON } from '../../../utils/json.utils';
import { CategorizedJob, Classification, LlmProvider, SummarizedJob } from './llm-provider.interface';
import Groq from 'groq-sdk';
import { categorizeResponseSchema, classifyResponseSchema, summarizeJobSchema } from '../schema/llm-response.schema';
import { SupportProviders } from './llm-provider.factory';
import { UserExperienceAttributes } from '../../interfaces/user.interface';
import {
  CATEGORIZE_ASSISTANT_MESSAGE,
  getJobMatchAssistantMessage,
  SUMMARIZE_ASSISTANT_MESSAGE,
} from '../llm.messages';

const GROQ_MODEL_LLAMA3_70B = 'llama3-70b-8192';

@Injectable()
export class GroqProvider implements LlmProvider {
  readonly _logger = new Logger(GroqProvider.name);
  identifier: SupportProviders = 'groq';

  private _groq: Groq;

  constructor(private readonly configService: ConfigService) {
    this._groq = new Groq({
      apiKey: configService.getOrThrow('GROQ_API_KEY'),
    });
  }

  async matchJob(experience: UserExperienceAttributes, jobSummary: JobSummaryAttributes): Promise<Classification> {
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
Experience:
${jobSummary.experienceRequirements}
Responsibilities:
${jobSummary.responsibilities}
Technical Skills:
${jobSummary.technicalStack}
###
`;
    const response = await this._groq.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: getJobMatchAssistantMessage(experience),
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
      ...classifyResponseSchema.parse(res),
    };
  }

  async categorizeJobs(jobs: ({
    id: string
  } & Pick<JobAttributesRequired, 'title'>)[]): Promise<{ results?: CategorizedJob[] }> {
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

List of jobs: ID|TITLE
---
${jobs.map(j => `${j.id}|${j.title}`).join('\n')}}
`;
    const response = await this._groq.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: CATEGORIZE_ASSISTANT_MESSAGE,
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
          content: SUMMARIZE_ASSISTANT_MESSAGE,
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
