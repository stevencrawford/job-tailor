import { Injectable } from '@nestjs/common';
import { JobAttributes, JobWithId } from '@/app/services/interfaces/job.interface';
import { PrismaService } from '@/app/services/prisma/prisma.service';
import { LlmProviderFactory } from '@/app/services/llm/providers/llm-provider.factory';

@Injectable()
export class JobSummarizeService {

  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _llmProviderFactory: LlmProviderFactory,
  ) {
  }

  async summarizeJob(job: Pick<JobAttributes, 'description'> & JobWithId) {
    const summarizedJob = await this._llmProviderFactory.get('groq').summarizeJob(job);

    await this._prismaService.jobSummary.create({
      data: {
        jobId: job.id,
        // ...summarizedJob, // TODO: need to enable strict null to fix this, I think!
        experienceRequirements: summarizedJob.experienceRequirements,
        responsibilities: summarizedJob.responsibilities,
        interviewProcess: summarizedJob.interviewProcess,
        technicalStack: summarizedJob.technicalStack,
        applicationProcess: summarizedJob.applicationProcess,
        aiProvider: 'GROQ' // FIXME: summarizedJob.aiProvider.toUpperCase()
      },
    });
  }
}
