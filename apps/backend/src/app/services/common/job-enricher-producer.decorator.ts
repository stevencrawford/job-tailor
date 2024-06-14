import { InjectFlowProducer } from '@nestjs/bullmq';
import { JOB_ENRICHER_PRODUCER } from './queue.constants';

export const InjectJobEnricher = () => InjectFlowProducer(JOB_ENRICHER_PRODUCER);
