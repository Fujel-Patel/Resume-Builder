// globals.css imported in root layout
import Sidebar from '@/components/dashboard/Sidebar';
import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-gray-200">
        <Sidebar />
      </aside>
      <main className="flex-1 p-6 bg-white overflow-auto">
        {children}
      </main>
    </div>
  );
}
