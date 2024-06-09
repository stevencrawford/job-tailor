import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { AIModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AIModule
  ],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {
}
