'use client';

import * as React from 'react';
import { Separator } from '@/shared/frontend/ui-shadcn/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="flex h-screen w-full bg-slate-50">
      <div className="flex h-[52px] items-center px-4">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>
      <Separator />
      <div className="p-4">
      </div>
    </div>
  );
}
