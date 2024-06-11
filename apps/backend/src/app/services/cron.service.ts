import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataCollectorService } from './data-collector/data-collector.service';

@Injectable()
export class CronService {
  readonly _logger = new Logger(CronService.name);

  constructor(
    private readonly _dataCollectorService: DataCollectorService,
  ) {
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async fetchEvery6Hours() {
    await this._dataCollectorService.collectEvery6HourData();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async fetchEveryDay() {
    await this._dataCollectorService.collectEvery6HourData();
  }
}
