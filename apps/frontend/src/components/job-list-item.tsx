'use client';

import { Badge } from '@/shared/frontend/ui-shadcn/components/ui/badge';
import { Button } from '@/shared/frontend/ui-shadcn/components/ui/button';
import { DollarSignIcon, LocateIcon, ServerOffIcon } from 'lucide-react';
import { Job } from '@/app/(dashboard)/dashboard/data';
import { useSelectedJob } from '@/hooks/use-selected-job';
import { cn } from '@/shared/frontend/ui-shadcn/lib/utils';

interface JobListItemProps {
  job: Job,
  onClick: (job: Job) => void,
  selected?: boolean
}

export default function JobListItem({ job, onClick, selected }: JobListItemProps) {
  const [selectedJob, setSelectJob] = useSelectedJob();

  return (
    <button
      key={job.id}
      className={cn(
        'flex items-center justify-between p-4 border bg-white rounded-lg shadow-sm hover:bg-accent',
        selected && 'bg-muted',
      )}
      onClick={() => {
        onClick(job);
        setSelectJob({
          ...selectedJob,
          selected: job.id,
        });
      }}
    >
      <div>
        <div className="flex">
          <h2 className="font-semibold my-2 text-left">{job.title}</h2>
          <div className="ml-4 flex items-center flex-wrap gap-2">
            {job.skills.slice(0, 3).map((skill, index) => (
              <Badge variant={'outline'} key={index}>
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && <Badge>+{job.skills.length - 3}</Badge>}
          </div>
        </div>
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <LocateIcon className="h-4 w-4" />
            <span>{job.company}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ServerOffIcon className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSignIcon className="h-4 w-4" />
            <span>{job.compensation}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Badge variant="secondary">{job.datePosted}</Badge>
        <Button>Apply</Button>
      </div>
    </button>
  );
}
