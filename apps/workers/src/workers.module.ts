import { Module } from '@nestjs/common';
import { EventsModule } from '@libs/nestjs-libraries/common/events.module';
import { CrawlerModule } from '@libs/nestjs-libraries/crawler/crawler.module';
import { CrawlerService } from '@libs/nestjs-libraries/crawler/crawler.service';
import { RefreshJobsController } from './app/refresh-jobs.controller';

@Module({
  imports: [
    EventsModule.registerAsync(),
    CrawlerModule,
  ],
  controllers: [RefreshJobsController],
  providers: [CrawlerService],
})
export class WorkersModule {
}
