import { Injectable, Logger } from '@nestjs/common';
import { JobAttributes, JobWithId } from '@/app/services/interfaces/job.interface';
import { PrismaService } from '@/app/services/prisma/prisma.service';
import { LlmProviderFactory } from '@/app/services/llm/providers/llm-provider.factory';
import { AIProvider } from '@prisma/client';
import Bottleneck from 'bottleneck';

@Injectable()
export class JobSummarizeService {
  readonly _logger = new Logger(JobSummarizeService.name);

  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _llmProviderFactory: LlmProviderFactory,
  ) {
  }

  async summarizeBulk(candidates: (JobWithId & Pick<JobAttributes, 'description'> & {
    candidates: number
  })[]) {
    const limiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: 60_000 / 5,
    });

    // Find the max number of candidates across all jobs
    const maxCandidates = Math.max(candidates.map(jobListing => jobListing.candidates).reduce((a, b) => a + b, 0));
    // Find the min number of candidates across all jobs
    const minCandidates = Math.min(candidates.map(jobListing => jobListing.candidates).reduce((a, b) => a + b, 0));

    candidates
      .filter(jobListing => jobListing.description && jobListing.description.trim().length > 0)
      .map(async (jobListing) => {
        // Create a scaled priority which is between 1-10 based on number of candidates
        const priority = Math.round((jobListing.candidates - minCandidates) / (maxCandidates - minCandidates) * 10);
        await limiter.schedule({
            id: `job-summarize-${jobListing.id}`,
            priority,
          },
          () => this.summarize(jobListing));
      });
  }

  async summarize(job: Pick<JobAttributes, 'description'> & JobWithId) {
    const summarizedJob = await this._llmProviderFactory.get('groq').summarizeJob(job);

    await this._prismaService.jobSummary.create({
      data: {
        jobId: job.id,
        ...summarizedJob,
        aiProvider: summarizedJob.aiProvider.toUpperCase() as AIProvider,
      },
    });
  }
}
