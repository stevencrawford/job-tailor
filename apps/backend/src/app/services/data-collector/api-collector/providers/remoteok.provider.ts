import { Injectable } from '@nestjs/common';
import { IJobDispatcher } from '../../data-collector.interface';
import { AxiosApiCrawler } from '../axios-api-crawler';
import { IDataProvider } from '../../data-provider.interface';
import { JobAttributes } from '../../../interfaces/job.interface';
import { z } from 'zod';

@Injectable()
export class RemoteOkProvider implements IDataProvider<AxiosApiCrawler> {
  readonly _identifier = 'remoteok.com';

  fetchUrl(options: { jobCategory: string; jobLevel: string; region?: string }): string {
    return '';
  }

  supports(url: string): boolean {
    return false;
  }

  handle(dispatcher: IJobDispatcher): AxiosApiCrawler {
    return new AxiosApiCrawler({
      responseHandler: async (response) => {
        const jobs = response.data.jobs;
        const jobListings: JobAttributes[] = jobs.map((job: JobData) => ({
          title: job.position,
          url: job.url,
          timestamp: job.epoch * 1000,
          company: job.company,
          location: job.location,
          category: job.tags.join(', '),
          description: job.description,
          compensation: (job.salary_min && job.salary_max) ? `${job.salary_min} - ${job.salary_max}` : '',
        }));

        dispatcher.dispatch({
          collectorConfig: {
            name: this._identifier,
          },
          jobListings,
        });
      },
    });
  }
}

const jobSchema = z.object({
  slug: z.string(),
  id: z.string(),
  epoch: z.number(),
  date: z.string(),
  company: z.string(),
  position: z.string(),
  tags: z.array(z.string()),
  description: z.string(),
  location: z.string(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  apply_url: z.string().url(),
  url: z.string().url(),
});

export type JobData = z.infer<typeof jobSchema>;
