'use client';

import * as React from 'react';
import { sidebarAtom } from '@/hooks/use-sidebar';
import { TooltipProvider } from '@/shared/frontend/ui-shadcn/components/ui/tooltip';
import { useAtom } from 'jotai';
import { NavItem } from '@/components/nav-item';
import { Briefcase, Link, Settings, User } from 'lucide-react';
import { Separator } from '@/shared/frontend/ui-shadcn';

export function DashboardNav() {
  const [isMinimized] = useAtom(sidebarAtom);

  return (
    <nav className="grid items-start gap-2">
      <TooltipProvider>
        <NavItem
          isCollapsed={isMinimized}
          links={[
            {
              title: "Jobs",
              href: '/dashboard',
              icon: Briefcase,
              variant: "default",
            },
            {
              title: "Profile",
              href: '/dashboard/profile',
              icon: User,
              variant: "ghost",
            },
          ]}
        />
        <Separator />
        <NavItem
          isCollapsed={isMinimized}
          links={[
            {
              title: "Connectors",
              href: '/dashboard/connectors',
              icon: Link,
              variant: "ghost",
            },
            {
              title: "Settings",
              href: '/dashboard/settings',
              icon: Settings,
              variant: "ghost",
            },
          ]}
        />
      </TooltipProvider>
    </nav>
  );
}
