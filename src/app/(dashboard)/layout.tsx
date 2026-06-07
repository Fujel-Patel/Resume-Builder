// globals.css imported in root layout
import type { ReactNode } from 'react';
import { PageMetaProvider } from '@/components/dashboard/PageMetaContext';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <PageMetaProvider>
      <DashboardShell>{children}</DashboardShell>
    </PageMetaProvider>
  );
}
