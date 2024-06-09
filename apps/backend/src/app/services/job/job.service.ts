import { Injectable, Logger } from '@nestjs/common';
import { RawJob } from './job.interface';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { AIProviderFactory } from '../ai/ai-provider.factory';
import Redis from 'ioredis';
import { asyncFilter } from '../../utils/core.utils';
import { CategorizedJob } from '../ai/ai-provider.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobService {
  readonly _logger = new Logger(JobService.name);

  constructor(
    @InjectRedis() private readonly _redis: Redis,
    private readonly _aiProviderFactory: AIProviderFactory,
    private _prismaService: PrismaService,
  ) {
  }


  async processAll(userId: string,
                   source: string,
                   jobs: Pick<RawJob, 'title' | 'url' | 'timestamp'>[],
  ) {
    // 1. Filter out already seen by user
    const untracked: Pick<RawJob, 'title' | 'url' | 'timestamp'>[] = await asyncFilter(jobs, async (job: Pick<RawJob, 'url'>): Promise<boolean> =>
      !(await this._redis.sismember(`seen:${userId}:${source}`, job.url) === 1),
    );
    this._logger.log(`[${source}] Untracked ${untracked.length} jobs.`);

    // 2. Persist all jobs
    const saved = await Promise.all(
      untracked.map(async (job) => {
        const createdJob = await this._prismaService.job.create({
          data: {
            userId,
            source,
            ...job,
          },
        });
        return {
          ...createdJob,
          ...job,
          source,
        };
      }),
    );

    // 3. Process them via AI to get job category and level
    const categorized = await this._aiProviderFactory.get('groq').categorizeJobs(saved);
    this._logger.log(`[${source}] Categorized ${categorized.results.length} jobs.`);

    // 4. Update categorization for all jobs
    await Promise.all(
      categorized.results?.map(async (job: (Partial<RawJob> & { id: string } & CategorizedJob)) => {
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

    // // 5. Filter to only job where decision == APPLY
    // const apply = categorized.results?.filter(value => value.decision == AI_DECISION.APPLY);
    // this._logger.log(`[${source}] Found ${apply.length} jobs to apply to.`);

    // 6. Track to avoid revisiting
    await Promise.all(jobs.map(job => {
      this._redis.sadd(`seen:${userId}:${source}`, job.url);
    }));

    // 7. Update connector last successful run
    await this._prismaService.connector.update({
      where: {
        name: source
      },
      data: {
        lastSuccess: new Date()
      }
    });

    return categorized.results;
  }

  async classifyJob(job: RawJob & { id: string }) {
    const classifiedJob = await this._aiProviderFactory.get('groq').classifyJob(job);
    await this._prismaService.job.update({
      where: {
        id: job.id,
      },
      data: {
        ...classifiedJob,
      },
    });
  }
}
