import { Global, Module } from '@nestjs/common';
import { JobRepository } from './jobs/job.repository';
import { PrismaRepository, PrismaService } from './prisma.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    PrismaRepository,
    JobRepository
  ],
  get exports() {
    return this.providers;
  },
})
export class DatabaseModule {}
