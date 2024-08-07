import { Injectable, Logger } from '@nestjs/common';
import { LlmProviderFactory } from '@/app/services/llm/providers/llm-provider.factory';
import { CategorizedJob } from '@/app/services/llm/providers/llm-provider.interface';
import { PrismaService } from '@/app/services/prisma/prisma.service';
import { JobAttributesRequired, JobLevel, jobLevelSchema, JobWithId } from '@/app/services/interfaces/job.interface';

@Injectable()
export class JobCategorizeService {
  readonly _logger = new Logger(JobCategorizeService.name);

  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _llmProviderFactory: LlmProviderFactory,
  ) {
  }

  async categorizeJobs(jobs: Array<JobWithId & Pick<JobAttributesRequired, 'title'>>,
  ) {
    const categorizedJobs = await this._llmProviderFactory.get('groq').categorizeJobs(jobs);

    return await Promise.all(
      categorizedJobs.results?.map(async (job: (JobWithId & CategorizedJob)) => {
        const { id, category, level } = job;
        return this._prismaService.job.update({
          where: {
            id,
          },
          data: {
            category,
            level: jobLevelSchema.catch(JobLevel.UNKNOWN).parse(level),
          },
        });
      }) ?? [],
    );
  }

}
