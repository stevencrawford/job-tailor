import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { LlmModule } from '../llm/llm.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    LlmModule
  ],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {
}
