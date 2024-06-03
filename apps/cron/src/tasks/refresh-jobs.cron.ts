import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BullMqClient } from '@libs/nestjs-libraries/bull-mq-transport/client/bull-mq.client';

@Injectable()
export class RefreshJobsCron {

  constructor(
    private _bullMqClient: BullMqClient,
  ) {
  }

  @Cron('* * * * *')
  async refreshJobs() {
    console.log('Kicking off Jobs Refresh...');
    this._bullMqClient.emit('refresh-jobs', {
      payload: {
        provider: 'web3.career',
      },
    });
  }
}
