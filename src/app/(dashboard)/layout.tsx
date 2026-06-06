// globals.css imported in root layout
import PageTransition from '@/components/ui/PageTransition';
import type { ReactNode } from 'react';
import ThemeToggle from '@/components/shared/ThemeToggle';

import { PageMetaProvider, usePageMeta } from '@/components/dashboard/PageMetaContext';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { title, breadcrumbs } = usePageMeta();
  return (
    <PageMetaProvider>
    <div className="flex min-h-screen bg-[--bg-base]">
      {/* Sidebar - sticky on left */}
      <aside className="w-[260px] flex-shrink-0 border-r border-[--border] bg-[--sidebar-bg] text-[--sidebar-text] sticky top-0">
        <div className="h-full px-4 py-6">
          <SidebarNavigation />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header bar */}
        <header className="flex items-center justify-between p-4 border-b border-[--border] bg-[--bg-surface]">
          <div className="flex flex-col">
            {/* Dynamic title and breadcrumbs */}
            <div className="text-xl font-bold text-[--text-primary]">
              {title}
            </div>
            {breadcrumbs.length > 0 && (
              <nav className="text-sm text-[--text-secondary]" aria-label="Breadcrumb">
                <ol className="flex space-x-2">
                  {breadcrumbs.map((crumb, idx) => (
                    <li key={idx} className="flex items-center">
                      {crumb.href ? (
                        <a href={crumb.href} className="hover:underline">{crumb.label}</a>
                      ) : (
                        <span>{crumb.label}</span>
                      )}
                      {idx < breadcrumbs.length - 1 && <span className="mx-1">/</span>}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* User avatar placeholder */}
            <div className="h-8 w-8 rounded-full bg-[--bg-hover] flex items-center justify-center text-[--text-muted]">
              {/* Using first letter of a placeholder name */}

              {/* We'll use a placeholder like "U" for now */}
              U
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}