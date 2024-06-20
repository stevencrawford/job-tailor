import { Controller, Get, Logger } from '@nestjs/common';
import { DataCollectorService } from '@/app/services/data-collector/data-collector.service';

@Controller('health')
export class HealthController {
  readonly _logger = new Logger(HealthController.name);

  constructor(
    private readonly _dataCollectorService: DataCollectorService,
  ) {
  }

  @Get()
  public async getHealth() {
    await this._dataCollectorService.collectDailyData();
    return {
      status: 'OK',
    };
  }
}
