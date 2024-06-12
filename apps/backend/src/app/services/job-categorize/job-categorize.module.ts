import { Module } from '@nestjs/common';
import { JobCategorizeService } from './job-categorize.service';
import { LlmModule } from '../llm/llm.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    LlmModule
  ],
  providers: [JobCategorizeService],
  exports: [JobCategorizeService],
})
export class JobCategorizeModule {
}
