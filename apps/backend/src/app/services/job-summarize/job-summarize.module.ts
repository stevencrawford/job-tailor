import { Module } from '@nestjs/common';
import { JobSummarizeService } from './job-summarize.service';
import { LlmModule } from '../llm/llm.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    LlmModule
  ],
  providers: [JobSummarizeService],
  exports: [JobSummarizeService],
})
export class JobSummarizeModule {}
