import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BullMqClient } from '@libs/nestjs-libraries/bull-mq-transport/client/bull-mq.client';
import { FETCH_JOBS } from '@libs/nestjs-libraries/ai/common/queues.common';
import { ConnectorRepository } from '@libs/nestjs-libraries/database/connectors/connector.repository';

@Injectable()
export class FetchJobsCron {
  readonly _logger = new Logger(FetchJobsCron.name);

  constructor(
    private readonly _bullMqClient: BullMqClient,
    private readonly _connectorRepository: ConnectorRepository,
  ) {
  }

  @Cron('* * * * *')
  async fetchJobs() {
    this._connectorRepository.findAll().then(async (connectors) => {
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
