import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BullMqClient } from '@libs/nestjs-libraries/bull-mq-transport/client/bull-mq.client';
import { FETCH_JOBS } from '../events/job-queue.interface';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class CronService {
  readonly _logger = new Logger(CronService.name);

  constructor(
    private readonly _bullMqClient: BullMqClient,
    private readonly _prismaService: PrismaService,
  ) {
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async fetchJobs() {
    this._prismaService.connector.findMany({ where: { status: 'ONLINE' } }).then(async (connectors) => {
      for (const connector of connectors) {
        this._logger.log(`Sending fetch-jobs event for ${connector.name}`);
        this._bullMqClient.emit(FETCH_JOBS, {
          payload: {
            connector: connector.name,
          },
        });
      }
    });
  }
}
