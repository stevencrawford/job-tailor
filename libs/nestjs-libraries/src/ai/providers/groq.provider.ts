import { Injectable } from '@nestjs/common';
import { RawJob } from '../../dto/job.dto';
import { ConfigService } from '@nestjs/config';
import { parseJSON } from '../../utils/json.util';
import { AIProvider, Classification, RankedJobs } from '../ai-provider.interface';
import Groq from 'groq-sdk';
import { CLASSIFIED_TYPE, classifyResponseSchema, rankResponseSchema } from '../schema/ai-response.schema';
import { ASSISTANT_MESSAGE } from '../common/ai-provider.common';
import { SupportProviders } from '../ai-provider.factory';

const GROQ_MODEL = 'llama3-70b-8192';

@Injectable()
export class GroqProvider implements AIProvider {
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
2. When the decision is not "APPLY" include "reason" field to explain why I should "CONSIDER" or "IGNORE" the role, otherwise exclude the reason field.

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
      model: GROQ_MODEL,
      response_format: {
        type: 'json_object',
      },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error(`Groq was unable to process the request.`);
    }

    const res = parseJSON(content);
    return {
      ...job,
      ...classifyResponseSchema.parse(res),
      state: CLASSIFIED_TYPE.CLASSIFIED_FULL as const,
    };
  }


  async rankJobTitles(jobs: Pick<RawJob, 'title' | 'url'>[]): Promise<RankedJobs> {
    const message = `Return a JSON { "results": Array<{"id": string, "title": string, "url": string, "score": number, "decision": "APPLY" | "CONSIDER" | "IGNORE", state: "CLASSIFIED_TITLE" }>}.

An example response would be:
{
  "results": [
    {
      "id": "Job ID passed in",
      "title": "Job Title passed in",
      "state": "CLASSIFIED_TITLE",
      "url": "https://...",
      "score": 0-10,
      "decision": "APPLY" | "CONSIDER" | "IGNORE"
    }
    ...
  ]
}

Rules:
1. The "decision" field: score < 5: "IGNORE", 5 <= score < 7: "CONSIDER", and score >= 7: "APPLY".  

The list of jobs:
###
${JSON.stringify(jobs)}
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
      model: GROQ_MODEL,
      response_format: {
        type: 'json_object',
      },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error(`Groq was unable to process the request.`);
    }

    const res = parseJSON(content);
    return rankResponseSchema.parse(res);
  }

}
