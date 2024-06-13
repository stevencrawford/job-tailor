import { JobLevel } from './job.interface';

export interface UserAttributes {
  email: string;
  name: string;
}

export interface UserWithId {
  id: string;
}

export interface UserSearchAttributes {
  jobCategory: string;
  jobLevel?: JobLevel;
  region?: string;
}

export interface UserExperienceAttributes {
  jobTitle: string;
  company?: string;
  location?: string;
  responsibilities: string;
  skillsUsed?: string;
  startDate?: string;
  endDate?: string;
  tenure?: number;
  tenureUnit?: 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS';
}
