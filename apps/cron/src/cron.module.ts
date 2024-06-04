import { Module } from '@nestjs/common';
import { FetchJobsCron } from './tasks/fetch-jobs.cron';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsModule } from '@libs/nestjs-libraries/common/events.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventsModule.registerAsync(),
  ],
  controllers: [],
  providers: [FetchJobsCron],
})
export class CronModule {
}
