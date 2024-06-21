import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { PrismaService } from '@/app/services/prisma/prisma.service';
import { DATA_COLLECTOR_FETCH } from '@/app/services/common/queue.constants';
import ms from 'ms';
import { IDataCollectorConfig } from '@/app/services/data-collector/data-collector.interface';
import { IDataCollectorProcessRequest } from '@/app/services/interfaces/queue.interface';

@Injectable()
export class DataCollectorService {
  readonly _logger = new Logger(DataCollectorService.name);

  constructor(
    @InjectQueue(DATA_COLLECTOR_FETCH) private readonly _dataCollectorQueue: Queue<IDataCollectorProcessRequest>,
    private readonly _prismaService: PrismaService,
  ) {
  }

  public async addJobsToQueue(jobs: { data: IDataCollectorProcessRequest; name: string; opts?: JobsOptions }[]) {
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
        frequency,
        status: 'ONLINE',
        healthy: true,
        lastRun: {
          lte: new Date(Date.now() - ms('5m')),
        },
      },
    });
    this._logger.log(`Found ${collectors.length} connectors`);
    await this.addJobsToQueue(collectors.map((collector) => {
        return {
          data: {
            collectorConfig: {
              ...collector,
              lastRun: collector.lastRun?.getTime() ?? new Date().getTime(),
            },
          } as IDataCollectorProcessRequest,
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
