import { Controller } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';

@Controller()
export class CheckJobsController {

  @EventPattern('check-jobs', Transport.REDIS)
  async checkStars(data: { provider: string }) {
    console.log(`'Worker received check-jobs event for ${data.provider}`);
  }

}
