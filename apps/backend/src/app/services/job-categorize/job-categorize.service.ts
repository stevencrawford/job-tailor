import { Injectable, Logger } from '@nestjs/common';
import { LlmProviderFactory } from '../llm/providers/llm-provider.factory';
import { CategorizedJob } from '../llm/providers/llm-provider.interface';
import { PrismaService } from '../prisma/prisma.service';
import { JobAttributesRequired, JobWithId } from '../interfaces/job.interface';

@Injectable()
export class JobCategorizeService {
  readonly _logger = new Logger(JobCategorizeService.name);

  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _llmProviderFactory: LlmProviderFactory,
  ) {
  }

  async categorize(jobs: (JobAttributesRequired & JobWithId)[],
  ) {
    const categorizedJobs = await this._llmProviderFactory.get('groq').categorizeJobs(jobs);

    await Promise.all(
      categorizedJobs.results?.map(async (job: (JobAttributesRequired & JobWithId & CategorizedJob)) => {
        await this._prismaService.job.update({
          where: {
            id: job.id,
          },
          data: {
            category: job.category,
            level: job.level,
            location: job.location,
          },
        });
      }),
    );

    return categorizedJobs.results;
  }

}
