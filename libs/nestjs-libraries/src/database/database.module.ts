import { Global, Module } from '@nestjs/common';
import { PrismaRepository, PrismaService } from './prisma.service';
import { JobRepository } from './jobs/job.repository';
import { ConnectorRepository } from './connectors/connector.repository';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    PrismaRepository,
    JobRepository,
    ConnectorRepository,
  ],
  get exports() {
    return this.providers;
  },
})
export class DatabaseModule {}
