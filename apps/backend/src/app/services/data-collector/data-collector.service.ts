import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { IDataCollectorConfig } from './data-collector.interface';
import { DATA_COLLECTOR_FETCH } from '../common/queue.constants';

@Injectable()
export class DataCollectorService {
  readonly _logger = new Logger(DataCollectorService.name);

  constructor(
    @InjectQueue(DATA_COLLECTOR_FETCH) private readonly _dataCollectorQueue: Queue<IDataCollectorConfig>,
    private readonly _prismaService: PrismaService,
  ) {
  }

  public async addJobToQueue({ data, name, opts }: {
    data: IDataCollectorConfig;
    name: string;
    opts?: JobsOptions;
  }) {
    return this._dataCollectorQueue.add(name, data, opts);
  }

  public async addJobsToQueue(jobs: { data: IDataCollectorConfig; name: string; opts?: JobsOptions }[]) {
    return this._dataCollectorQueue.addBulk(jobs);
  }

  async collectEvery6HourData() {
    this._logger.log('Collecting data - collectEvery6HourData');
    await this.collectData('EVERY_6_HOURS');
  }

  async collectDailyData() {
    this._logger.log('Collecting data - collectDailyData');
    await this.collectData('EVERY_DAY');
  }

  async collectData(frequency: 'EVERY_DAY' | 'EVERY_6_HOURS') {
    const collectors = await this._prismaService.connector.findMany({
      where: {
        status: 'ONLINE',
        healthy: true,
        frequency,
      },
    });
    this._logger.log(`Found ${collectors.length} connectors`);
    await this.addJobsToQueue(collectors.map((collector) => {
        return {
          data: {
            ...collector,
            lastRun: collector.lastRun?.getTime() ?? new Date().getTime(),
          } as IDataCollectorConfig,
          name: `refresh-${collector.name}`,
        };
      }),
    );
  }

  async updateLastRun(collectorConfig: IDataCollectorConfig, error?: Error) {
    await this._prismaService.connector.update({
      where: {
        name: collectorConfig.name,
      },
      data: {
        lastRun: new Date(),
        lastSuccess: new Date(),
        ...(error != null ? {
          lastSuccess: null,
          healthy: false,
          error: error.message
        } : {}),
      },
    });
  }
}
