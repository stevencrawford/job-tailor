import { DefaultJobOptions } from 'bullmq';
import ms from 'ms';

export const defaultJobOptions: DefaultJobOptions = {
  attempts: Number.MAX_SAFE_INTEGER,
  backoff: {
    delay: ms('1 minute'),
    type: 'exponential'
  },
  removeOnComplete: true,
  removeOnFail: true,
};
