// globals.css imported in root layout
import type { ReactNode } from 'react';
import ThemeToggle from '@/components/shared/ThemeToggle';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[--bg-base]">
      {/* Sidebar - sticky on left */}
      <aside className="w-[260px] flex-shrink-0 border-r border-[--border] bg-[--sidebar-bg] text-[--sidebar-text] sticky top-0">
        {/* The sidebar component will be rendered here */}
        <div className="h-full px-4 py-6">
          {/* We'll render the Sidebar component next (task 4) */}
          {/* For now, we'll leave it empty and let the Sidebar component fill it */}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header bar */}
        <header className="flex items-center justify-between p-4 border-b border-[--border] bg-[--bg-surface]">
          <div className="text-xl font-bold text-[--text-primary]">
            {/* Page title will be provided by each page via a slot or we can leave it as is and let children override? */}
            {/* We'll make it so that each page can set its own title by using a prop or context. */}
            {/* For simplicity, we'll leave it as a placeholder and let each page replace it if needed. */}
            {/* We'll just render the children? Actually, the children is the main content below the header. */}
            {/* We need a way to pass the title from the page to the layout. */}
            {/* We'll use a simple solution: each page can set the title by using a content slot. */}
            {/* However, to keep it simple and follow the task, we'll just output a fixed title for now. */}
            {/* We'll change it to be dynamic later if needed. */}
            Dashboard
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
          {children}
        </main>
      </div>
    </div>
  );
}