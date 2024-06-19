'use client';

import { ScrollArea } from '@/shared/frontend/ui-shadcn/components/ui/scroll-area';
import { useSelectedJob } from '@/hooks/use-selected-job';
import JobListItem from '@/components/job-list-item';
import { Job } from '@/app/(dashboard)/dashboard/data';

interface JobListProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

export function JobList({ jobs, onJobClick } : JobListProps) {
  const [selectedJob] = useSelectedJob()

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {jobs.map((job) => (
          <JobListItem job={job} key={job.id} onClick={onJobClick} selected={selectedJob?.selected === job.id} />
        ))}
      </div>
    </ScrollArea>
  );
}
