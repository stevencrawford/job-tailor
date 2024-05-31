import { Module } from '@nestjs/common';
import { CheckJobs } from './tasks/check.jobs';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsModule } from '@libs/nestjs-libraries/common/events.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventsModule.registerAsync()
  ],
  controllers: [],
  providers: [CheckJobs]
})
export class CronModule {
}
