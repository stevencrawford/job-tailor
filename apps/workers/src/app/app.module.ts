import { Module } from '@nestjs/common';
import { EventsModule } from '@libs/nestjs-libraries/common/events.module';

@Module({
  imports: [
    EventsModule.registerAsync()
  ],
  controllers: [],
  providers: []
})
export class AppModule {
}
