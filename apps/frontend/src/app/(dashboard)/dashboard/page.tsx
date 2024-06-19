'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Separator } from '@/shared/frontend/ui-shadcn/components/ui/separator';
import { Input } from '@/shared/frontend/ui-shadcn/components/ui/input';
import { Drawer, DrawerContent } from '@/shared/frontend/ui-shadcn/components/ui/drawer';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/shared/frontend/ui-shadcn/components/ui/resizable';
import { JobDetail } from '@/components/job-detail';
import { Job, jobs } from '@/app/(dashboard)/dashboard/data';
import { JobList } from '@/components/job-list';

export default function DashboardPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const defaultLayout = [440, 300];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Check initial screen size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };
  const onDetailsClose = () => {
    setSelectedJob(null);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50">
      <div className="flex-1">
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            document.cookie = `react-resizable-panels:layout=${JSON.stringify(
              sizes,
            )}`;
          }}
          className="h-screen overflow-hidden"
        >
          <ResizablePanel defaultSize={defaultLayout[0]} minSize={30}>
            <div className="flex h-[52px] items-center px-4">
              <h1 className="text-xl font-bold">Jobs</h1>
            </div>
            <Separator />
            <div className="p-4">
              <form>
                <div className="relative bg-white">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <div className="overflow-hidden rounded-md">
              <JobList jobs={jobs} onJobClick={handleJobClick} />
            </div>
          </ResizablePanel>
          {selectedJob && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel className={'hidden md:block'} defaultSize={defaultLayout[1]}>
                <JobDetail job={selectedJob} onClose={onDetailsClose} />
              </ResizablePanel>
              <div className="md:hidden">
                <Drawer open={!!selectedJob && isMobile} onClose={onDetailsClose}>
                  <DrawerContent className="max-h-[80vh] h-screen">
                    <JobDetail job={selectedJob} />
                  </DrawerContent>
                </Drawer>
              </div>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
