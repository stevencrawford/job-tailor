import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BullMqClient } from '@libs/nestjs-libraries/bull-mq-transport/client/bull-mq.client';

@Injectable()
export class FetchJobsCron {

  constructor(
    private _bullMqClient: BullMqClient,
  ) {
  }

  @Cron('* * * * *')
  async fetchJobs() {
    console.log('Kicking off Jobs Fetch...');
    // TODO: Look up all Job sources and dispatch a message for each one
    this._bullMqClient.emit('fetch-jobs', {
      payload: {
        source: 'web3.career',
      },
    });
  }
}
