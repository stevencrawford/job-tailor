'use client';

import { useEffect } from 'react';

import { Button } from '@/shared/frontend/ui-shadcn/components/ui/button';
import { Badge } from '@/shared/frontend/ui-shadcn/components/ui/badge';
import { XIcon } from 'lucide-react';

interface JobDetailsProps {
  job: Job | null;
  onClose?: () => void;
}

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  source: string;
  datePosted: string;
  description: string;
  skills: string[];
  experience: string;
};

export function JobDetail({ job, onClose }: JobDetailsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!job) return null;

  return (
    <div
      className="bg-white fixed inset-x-0 top-10 p-6 md:static md:w-full md:h-screen md:p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{job.title}</h2>
        {onClose && <Button variant="ghost" onClick={onClose}>
          <XIcon className="h-5 w-5" />
        </Button>}
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Job Description</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{job.description}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Required Skills</h3>
          <div className="text-sm flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <Badge variant={'outline'} key={index}>
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Experience Level</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{job.experience}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Location</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{job.location}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Source</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{job.source}</p>
        </div>
      </div>
      <div className="mt-8">
        <Button variant="default" className="w-full">
          Apply
        </Button>
      </div>
    </div>
  );
}
