import { Injectable, Logger } from '@nestjs/common';
import { LlmProviderFactory } from '../llm/llm-provider.factory';
import { CategorizedJob } from '../llm/llm-provider.interface';
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
    // 1. Process them via AI to get job category and level
    const categorized = await this._llmProviderFactory.get('groq').categorizeJobs(jobs);

    // 2. Update categorization for all jobs
    await Promise.all(
      categorized.results?.map(async (job: (JobAttributesRequired & { id: string } & CategorizedJob)) => {
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

    return categorized.results;
  }

}
