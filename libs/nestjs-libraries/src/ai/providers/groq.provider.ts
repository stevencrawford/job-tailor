import { Injectable } from '@nestjs/common';
import { RawJob } from '../../crawler/crawler-job.interface';
import { ConfigService } from '@nestjs/config';
import { parseJSON } from '../../utils/json.util';
import { AIProvider, Classification, RankedJobs } from '../ai-provider.interface';
import Groq from 'groq-sdk';
import { classifyResponseSchema, rankResponseSchema } from '../schema/ai-response.schema';
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
    const message = `Return a JSON { "score": number, "status": "APPLY" | "CONSIDER" | "REJECT", "reason": string }.

An example response would be:
{
  "score": 0-10,
  "status": "APPLY" | "CONSIDER" | "REJECT",
  "reason": "Not suitable because ..."
}

Rules:
1. The "status" field: score < 5: REJECT, 5 <= score < 7: CONSIDER, and score >= 7: APPLY. 
2. When the status is not "APPLY" include the "reason" field to explain why I should "CONSIDER" or "REJECT" the role.

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

    const res = parseJSON(content);
    return {
      ...job,
      ...classifyResponseSchema.parse(res)
    };
  }


  async rankJobTitles(jobs: Partial<RawJob>[]): Promise<RankedJobs> {
    const message = `Return a JSON { "results": Array<{"title": string, "url": string, "score": number, "status": "APPLY" | "CONSIDER" | "REJECT" }>}.

An example response would be:
{
  "results": [
    {
      "title": "Job Title passed in",
      "url": "https://...",
      "score": 0-10,
      "status": "APPLY" | "CONSIDER" | "REJECT"
    }
    ...
  ]
}

Rules:
1. The "status" field: score < 5: "REJECT", 5 <= score < 7: "CONSIDER", and score >= 7: "APPLY".  

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

    const res = parseJSON(content);
    return rankResponseSchema.parse(res);
  }

}
