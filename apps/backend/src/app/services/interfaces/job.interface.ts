
export interface JobAttributesRequired {
  url: string;
  source: string;
  title: string;
  company: string;
  timestamp: number;
}

export interface JobAttributesOptional {
  location?: string;
  length?: string;
  roleType?: string;
  description?: string;
  compensation?: string;
}

export interface JobAttributes extends JobAttributesRequired, JobAttributesOptional {}

export interface JobSummaryAttributes {
  responsibilities: string;
  experienceRequirements: string;
  technicalStack: string
  interviewProcess: string;
  applicationProcess: string;
}

export interface JobWithId {
  id: string;
}

export enum JobLevel {
  INTERN = 'INTERN',
  ENTRY = 'ENTRY',
  MID_SENIOR = 'MID_SENIOR',
  STAFF = 'STAFF',
  DIRECTOR = 'DIRECTOR',
  EXECUTIVE = 'EXECUTIVE',
  UNKNOWN = 'UNKNOWN',
}

export enum JobCategory {
  // Engineering
  ENGINEER = 'Engineer',
  FULL_STACK_ENGINEER = 'Full-Stack Engineer',
  BACKEND_ENGINEER = 'Backend Engineer',
  FRONTEND_ENGINEER = 'Frontend Engineer',
  SITE_RELIABILITY_ENGINEER = 'Site Reliability Engineer',
  MOBILE_ENGINEER = 'Mobile Engineer',
  MOBILE_IOS_ENGINEER = 'Mobile iOS Engineer',
  MOBILE_ANDROID_ENGINEER = 'Mobile Android Engineer',
  QA_ENGINEER = 'QA Engineer',
  TECH_LEAD = 'Tech Lead',
  STAFF_ENGINEER = 'Staff Engineer',

  SUPPORT = 'Support',
  MARKETING = 'Marketing',
  PRODUCT = 'Product',
  MANAGEMENT = 'Management',
  SALES = 'Sales',
  OTHER = 'Other',
}

export const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});
