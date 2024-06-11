import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { DataCollectorModule } from '../services/data-collector/data-collector.module';

@Module({
  imports: [
    DataCollectorModule
  ],
  controllers: [HealthController],
})
export class ApiModule {}
