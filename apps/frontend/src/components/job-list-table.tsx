'use client';

import { Badge } from '@/shared/frontend/ui-shadcn/components/ui/badge';
import { ScrollArea } from '@/shared/frontend/ui-shadcn/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/frontend/ui-shadcn/components/ui/table';
import { Job } from '@/app/(dashboard)/dashboard/data';

interface JobListProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

export function JobListTable({ jobs, onJobClick } : JobListProps) {
  return (
      <ScrollArea className="h-[calc(80vh-20px)] border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="hidden lg:block">Skills</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job: Job) => (
              <TableRow
                key={job.id}
                onClick={() => onJobClick(job)}
                className="cursor-pointer transition-colors hover:bg-muted/60 data-[state=selected]:bg-muted text-xs"
              >
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell className="hidden lg:block">
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 3).map((skill, index) => (
                      <Badge variant={'outline'} key={index}>
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 3 && <Badge>+{job.skills.length - 3}</Badge>}
                  </div>
                </TableCell>
                <TableCell>{job.source}</TableCell>
                <TableCell>{job.datePosted}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
  );
}
