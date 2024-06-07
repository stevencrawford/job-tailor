import { Injectable, Logger } from '@nestjs/common';
import { RawJob } from '../dto/job.dto';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { AIProviderFactory } from '../ai/ai-provider.factory';
import { JobRepository } from '../database/jobs/job.repository';
import Redis from 'ioredis';
import { AI_DECISION } from '../ai/schema/ai-response.schema';
import { asyncFilter } from '../utils/core.utils';
import { Classification } from '../ai/ai-provider.interface';
import { ConnectorRepository } from '../database/connectors/connector.repository';

@Injectable()
export class JobService {
  readonly _logger = new Logger(JobService.name);

  constructor(
    @InjectRedis() private readonly _redis: Redis,
    private readonly _aiProviderFactory: AIProviderFactory,
    private _jobRepository: JobRepository,
    private _connectorRepository: ConnectorRepository,
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
        const createdJob = await this._jobRepository.createJob(userId, source, job);
        return {
          ...createdJob,
          ...job,
          source,
        };
      }),
    );

    // 3. Process them via AI to get decision
    const ranked = await this._aiProviderFactory.get('groq').rankJobTitles(saved);
    this._logger.log(`[${source}] Ranked ${ranked.results.length} jobs.`);

    // 4. Update decision for all jobs
    await Promise.all(
      ranked.results.map(async (job: (Partial<RawJob> & { id: string } & Classification)) => {
        await this._jobRepository.updateJob(job.id, job);
      }),
    );

    // 5. Filter to only job where decision == APPLY
    const apply = ranked.results
      .filter(value => value.decision == AI_DECISION.APPLY);
    this._logger.log(`[${source}] Found ${apply.length} jobs to apply to.`);

    // 6. Track to avoid revisiting
    await Promise.all(jobs.map(job => {
      this._redis.sadd(`seen:${userId}:${source}`, job.url);
    }));

    // 7. Update connector last successful run
    await this._connectorRepository.updateLastSuccess(source, new Date());

    return apply;
  }

  async classifyJob(job: RawJob & { id: string }) {
    const classifiedJob = await this._aiProviderFactory.get('groq').classifyJob(job);
    await this._jobRepository.updateJob(job.id, classifiedJob);
  }
}
