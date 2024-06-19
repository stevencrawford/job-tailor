'use client';

import React, { useState } from 'react';
import { cn } from '@/shared/frontend/ui-shadcn/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useAtom } from 'jotai';
import { sidebarAtom } from '@/hooks/use-sidebar';
import { DashboardNav } from '@/components/dashboard-nav';

export type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const [isMinimized, toggle] = useAtom(sidebarAtom);
  const [status, setStatus] = useState(false);

  const handleToggle = () => {
    setStatus(true);
    toggle(!isMinimized);
    setTimeout(() => setStatus(false), 500);
  };
  return (
    <nav
      className={cn(
        `relative hidden h-screen flex-none border-r lg:block`,
        status && 'duration-200',
        !isMinimized ? 'w-52' : 'w-[72px]',
        className
      )}
    >
      <ChevronLeft
        className={cn(
          'absolute -right-3 top-20 cursor-pointer rounded-full border bg-background text-3xl z-20 text-foreground',
          isMinimized && 'rotate-180'
        )}
        onClick={handleToggle}
      />
      <div className="space-y-4 py-4">
        <div className="space-y-1">
          <nav className="grid items-start gap-2">
            <DashboardNav />
          </nav>
        </div>
      </div>
    </nav>
  );
}
