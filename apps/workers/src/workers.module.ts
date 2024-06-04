import { Module } from '@nestjs/common';
import { EventsModule } from '@libs/nestjs-libraries/common/events.module';
import { CrawlerModule } from '@libs/nestjs-libraries/crawler/crawler.module';
import { CrawlerService } from '@libs/nestjs-libraries/crawler/crawler.service';
import { JobsQueueController } from './app/jobs-queue.controller';
import { AIProviderFactory } from '@libs/nestjs-libraries/ai/ai-provider.factory';
import { AIModule } from '@libs/nestjs-libraries/ai/ai.module';

@Module({
  imports: [
    EventsModule.registerAsync(),
    CrawlerModule,
    AIModule,
  ],
  controllers: [
    JobsQueueController,
  ],
  providers: [CrawlerService, AIProviderFactory],
})
export class WorkersModule {
}
