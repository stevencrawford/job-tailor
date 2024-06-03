import { Module } from '@nestjs/common';
import { RefreshJobsCron } from './tasks/refresh-jobs.cron';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsModule } from '@libs/nestjs-libraries/common/events.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventsModule.registerAsync(),
  ],
  controllers: [],
  providers: [RefreshJobsCron],
})
export class CronModule {
}
