import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/app/services/prisma/prisma.service';
import { JobAttributes, JobWithId } from '@/app/services/interfaces/job.interface';

@Injectable()
export class CandidateService {
  readonly _logger = new Logger(CandidateService.name);

  constructor(private readonly _prismaService: PrismaService) {
  }

  async findUsersWithMatchingJobCategories(
    jobs: Array<JobAttributes & JobWithId>,
  ): Promise<Array<JobWithId & JobAttributes & {
    candidates: number
  }>> {
    return await this._prismaService.$queryRaw<Array<JobWithId & JobAttributes & { candidates: number }>>`
        SELECT j.id,
               j.title,
               j.url,
               j.source,
               j.company,
               j.category,
               j.level,
               j.description,
               COUNT(DISTINCT us."userId") AS candidates
        FROM "Job" j
                 JOIN "JobCategory" jc ON j.category = jc.name
            OR j.category = (SELECT jcp.name
                             FROM "JobCategory" jcp
                             WHERE jcp.id = jc."parentId")
                 JOIN "UserSearch" us ON us.category = jc.name
        WHERE j.id IN (${Prisma.join(jobs.map(j => j.id))})
        GROUP BY j.id,
                 j.category
        HAVING COUNT(DISTINCT us."userId") > 0
        ORDER BY candidates DESC;
    `;
  }
}
