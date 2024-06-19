'use client';

import { DashboardNav } from '@/components/dashboard-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/frontend/ui-shadcn/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/frontend/ui-shadcn/lib/utils';

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn('block lg:!hidden')}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left" className="!px-0">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Overview
              </h2>
              <div className="space-y-1">
                <DashboardNav />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
