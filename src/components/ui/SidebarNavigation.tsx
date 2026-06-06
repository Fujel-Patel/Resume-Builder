import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardListIcon, BarChartIcon, SparklesIcon, CogIcon, QuestionMarkIcon, MessageCircleIcon, FolderIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

export default function SidebarNavigation() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if we're on mobile (< 640px)
  useEffect(() => {
    const checkIfMobile = () => {
      setIsCollapsed(window.innerWidth < 640);
    };

    // Check on mount
    checkIfMobile();

    // Check on resize
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Define the navigation structure
  const sections = [
    {
      title: 'Resume',
      items: [
        { href: '/builder', label: 'Builder', icon: DocumentTextIcon },
        { href: '/dashboard/builder', label: 'My Resumes', icon: FolderIcon },
        { href: '/templates', label: 'Templates', icon: ClipboardListIcon },
      ]
    },
    {
      title: 'ATS Tools',
      items: [
        { href: '/ats/score', label: 'Score Checker', icon: BarChartIcon },
        { href: '/ats/optimize', label: 'Optimizer', icon: SparklesIcon },
        { href: '/jd/parse', label: 'JD Parser', icon: ClipboardListIcon },
      ]
    },
    {
      title: 'AI Features',
      items: [
        { href: '/cover-letter', label: 'Cover Letter Generator', icon: DocumentTextIcon },
        { href: '/ai-demo', label: 'AI Demo', icon: SparklesIcon },
      ]
    },
    {
      title: 'Utilities',
      items: [
        { href: '/dashboard/utilities/settings', label: 'Settings', icon: CogIcon },
        { href: '/help', label: 'Help', icon: QuestionMarkIcon },
        { href: '/feedback', label: 'Feedback', icon: MessageCircleIcon },
      ]
    }
  ];

  return (
    <>
      {/* Mobile sidebar toggle button */}
      {!isCollapsed && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="fixed left-4 top-4 z-50 p-2 rounded-full hover:bg-[--bg-hover] transition-colors duration-200 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          aria-label="Toggle sidebar"
        >
          <span className="sr-only">Open sidebar</span>
          {/* Hamburger icon */}
          <div className="h-0.5 w-6 bg-[--text-primary] relative">
            <div className="absolute -top-1 left-0 h-0.5 w-6 bg-[--text-primary]" />
            <div className="absolute top-1 left-0 h-0.5 w-6 bg-[--text-primary]" />
          </div>
        </button>
      )}

      {/* Desktop sidebar (always visible on lg+) */}
      {!isCollapsed && (
        <aside className="hidden lg:block w-[260px] flex-shrink-0 border-r border-[--border] bg-[--sidebar-bg] text-[--sidebar-text]">
          <div className="h-full px-4 py-6">
            <nav className="space-y-6">
              {sections.map((section) => (
                <div key={section.title} className="mb-4">
                  <h3 className="text-xs font-medium text-[--sidebar-text]/60 uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={clsx(
                            'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2',
                            isActive
                              ? 'bg-[--bg-hover] text-[--text-primary]'
                              : 'text-[--sidebar-text]/60 hover:text-[--text-primary] hover:bg-[--bg-hover]/50'
                          )}
                        >
                          {item.icon && (
                            <item.icon
                              className={clsx(
                                'mr-3 h-4 w-4 flex-shrink-0',
                                isActive ? 'text-[--text-primary]' : 'text-[--sidebar-text]/60'
                              )}
                            />
                          )}
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* Mobile sidebar overlay */}
      {isCollapsed && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCollapsed(false)} />
          {/* Sidebar content */}
          <div className="fixed left-0 top-0 h-full w-[260px] bg-[--sidebar-bg] border-r border-[--border] text-[--sidebar-text] transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[--border]">
              <h3 className="text-xl font-bold text-[--text-primary]">
                Resume AI
              </h3>
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-2 rounded-full hover:bg-[--bg-hover] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                aria-label="Close sidebar"
              >
                <span className="sr-only">Close sidebar</span>
                {/* X icon */}
                <div className="h-4 w-4">
                  <line
                    x1="1"
                    y1="1"
                    x2="7"
                    y2="7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="7"
                    y1="1"
                    x2="1"
                    y2="7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </div>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <nav className="space-y-6">
                {sections.map((section) => (
                  <div key={section.title} className="mb-4">
                    <h3 className="text-xs font-medium text-[--sidebar-text]/60 uppercase tracking-wider mb-2">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                              'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2',
                              isActive
                                ? 'bg-[--bg-hover] text-[--text-primary]'
                                : 'text-[--sidebar-text]/60 hover:text-[--text-primary] hover:bg-[--bg-hover]/50'
                            )}
                          >
                            {item.icon && (
                              <item.icon
                                className={clsx(
                                  'mr-3 h-4 w-4 flex-shrink-0',
                                  isActive ? 'text-[--text-primary]' : 'text-[--sidebar-text]/60'
                                )}
                              />
                            )}
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}