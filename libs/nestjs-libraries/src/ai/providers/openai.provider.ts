import { Injectable } from '@nestjs/common';
import { RawJob } from '../../dto/job.dto';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { parseJSON } from '../../utils/json.util';
import { AIProvider, Classification, RankedJobs } from '../ai-provider.interface';
import { rankResponseSchema } from '../schema/ai-response.schema';
import { ASSISTANT_MESSAGE } from '../common/ai-provider.common';
import { SupportProviders } from '../ai-provider.factory';

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
    return Promise.resolve(null);
  }

  async rankJobTitles(jobs: Partial<RawJob>[]): Promise<RankedJobs> {
    const message = `Return a JSON { "results": Array<{"title": string, "url": string, "score": number, "status": "APPLY" | "CONSIDER" | "REJECT" }>}.

An example response would be:
{
  "results": [
    {
      "title": "Some Job Title",
      "url": "https://example.com/some-job-title",
      "score": 0-10,
      "status": "APPLY" | "CONSIDER" | "REJECT"
    }
    ...
  ]
}

Rules for "status" field are: score < 5: REJECT, 5 <= score < 7: CONSIDER, and score >= 7: APPLY  

The list of jobs:

###
${JSON.stringify(jobs)}
###
`;
    const response = await this._openai.chat.completions.create({
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
      n: 5,
      temperature: 1,
      model: 'gpt-3.5-turbo-16k',
      response_format: {
        type: 'json_object',
      },
    });

    const content = response.choices[0].message.content;

    const res = parseJSON(content);
    return rankResponseSchema.parse(res);
  }

}
