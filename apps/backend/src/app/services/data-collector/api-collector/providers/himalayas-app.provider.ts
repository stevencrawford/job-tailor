import { Injectable } from '@nestjs/common';
import { IJobDispatcher } from '../../data-collector.interface';
import { AxiosApiCrawler } from '../axios-api-crawler';
import { JobAttributes } from '../../../interfaces/job.interface';
import { z } from 'zod';
import { IDataProvider } from '../../data-provider.interface';

@Injectable()
export class HimalayasAppApiProvider implements IDataProvider<AxiosApiCrawler> {
  readonly _identifier = 'himalayas.app';

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
          title: job.title,
          url: job.applicationLink,
          timestamp: job.pubDate * 1000, // Convert from Unix timestamp to milliseconds
          company: job.companyName,
          location: job.locationRestrictions && job.locationRestrictions.join(', '),
          category: job.parentCategories?.length > 0 ? job.parentCategories.at(0) : job.categories?.at(0), // TODO: need way to resolve categories back to our categories
          description: job.description,
          roleType: job.seniority && job.seniority.join(', '),
          compensation: (job.minSalary && job.maxSalary) && `${job.minSalary} - ${job.maxSalary}`,
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
  title: z.string(),
  companyName: z.string(),
  minSalary: z.number().optional().nullable(),
  maxSalary: z.number().optional().nullable(),
  seniority: z.array(z.string()),
  locationRestrictions: z.array(z.string()),
  timezoneRestrictions: z.array(z.number()),
  categories: z.array(z.string()),
  parentCategories: z.array(z.string()).optional(),
  description: z.string(),
  pubDate: z.number(),
  applicationLink: z.string().url(),
});

export type JobData = z.infer<typeof jobSchema>;
