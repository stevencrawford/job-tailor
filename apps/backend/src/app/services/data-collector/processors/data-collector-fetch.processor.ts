import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { UnknownCollectorError } from '../errors/data-collector.error';
import { DataCollectorService } from '../data-collector.service';
import { DataCollectorFactory } from '../data-collector.factory';
import { DATA_COLLECTOR_FETCH } from '@/app/services/common/queue.constants';
import { IDataCollectorProcessRequest } from '@/app/services/interfaces/queue.interface';

@Processor(DATA_COLLECTOR_FETCH, { concurrency: 5 })
export class DataCollectorFetchProcessor extends WorkerHost {
  readonly _logger = new Logger(DataCollectorFetchProcessor.name);

  constructor(
    private readonly _collectorFactory: DataCollectorFactory,
    private readonly _dataCollectorService: DataCollectorService,
  ) {
    super();
  }

  async process(job: Job<IDataCollectorProcessRequest>) {
    this._logger.log(`Processing job ${job.id} with data ${JSON.stringify(job.data)}`);
    const { collectorConfig } = job.data;

    return this.processJobWithErrorHandler(job)
      .catch(async (err) => {
      // TODO: handle errors
      await this._dataCollectorService.updateLastRun(collectorConfig, err);
    });
  }

  private async processJobWithErrorHandler(
    job: Job<IDataCollectorProcessRequest>,
  ) {
    const { collectorConfig } = job.data;
    try {
      // Work on job
      const result = await this.handleJob(job);
      await this._dataCollectorService.updateLastRun(collectorConfig);
      return result;
    } catch (err) {
      if (err instanceof UnknownCollectorError) {
        this._logger.log(`Received UnknownCollectorError from ${collectorConfig.name}: ${err.message}`);
      }

      this._logger.log(`Received error from ${collectorConfig.name}: ${JSON.stringify(err.message)}`);

      // Unknown error
      throw err;
    }
  }

  private async handleJob(job: Job<IDataCollectorProcessRequest>) {
    const { collectorConfig } = job.data;
    const dataCollector = this._collectorFactory.get(collectorConfig.type);
    if (dataCollector) {
        return dataCollector.fetchData(collectorConfig);
    }
    return Promise.reject(new Error(`Connector type ${collectorConfig.type} not supported`));
  }

  @OnWorkerEvent('error')
  onError(err: Error): void {
    this._logger.error(`Error in worker: ${err.message}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<any>, err: Error): void {
    this._logger.warn(`Failed job ${job.id}: ${err.message}`);
  }
}
