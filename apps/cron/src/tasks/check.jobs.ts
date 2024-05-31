import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BullMqClient } from '@libs/nestjs-libraries/bull-mq-transport/client/bull-mq.client';

@Injectable()
export class CheckJobs {

  constructor(
    private _bullMqClient: BullMqClient
  ) {
  }

  @Cron('* * * * *')
  async checkJobs() {
    console.log('Kicking off Jobs Check...');
    this._bullMqClient.emit('check-jobs', {
      provider: 'linkedin'
    });
  }
}
