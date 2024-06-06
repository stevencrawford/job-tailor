import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../prisma.service';
import { RawJob } from '../../dto/job.dto';
import { Classification } from '../../ai/ai-provider.interface';

@Injectable()
export class JobRepository {
  constructor(
    private _job: PrismaRepository<'job'>,
  ) {
  }

  async createJob(
    userId: string,
    source: string,
    job: Pick<RawJob, 'title' | 'url' | 'timestamp'>,
  ) {
    return this._job.model.job.create({
      data: {
        ...job,
        source,
        state: 'RAW' as const,
        decision: 'UNKNOWN' as const,
        userId,
      },
      select: {
        id: true,
      },
    });
  }

  async updateJob(
    id: string,
    data: Partial<RawJob & Classification>,
  ) {
    return this._job.model.job.update({
      where: { id },
      data,
    });
  }

}
