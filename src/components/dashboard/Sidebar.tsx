import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  PencilIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  SparklesIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const pathname = usePathname();

  // Define nav items with groups
  const navGroups = [
    {
      title: 'BUILD',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: <HomeIcon className="h-5 w-5" />, current: pathname === '/' || pathname === '/dashboard' },
        { href: '/builder', label: 'Resume Builder', icon: <PencilIcon className="h-5 w-5" />, current: pathname.startsWith('/builder') },
        { href: '/templates', label: 'Templates', icon: <Squares2X2Icon className="h-5 w-5" />, current: pathname.startsWith('/templates') },
      ]
    },
    {
      title: 'OPTIMIZE',
      items: [
        { href: '/jd/parse', label: 'JD Keywords', icon: <MagnifyingGlassIcon className="h-5 w-5" />, current: pathname.startsWith('/jd/parse') },
        { href: '/ats/score', label: 'ATS Score', icon: <DocumentTextIcon className="h-5 w-5" />, current: pathname.startsWith('/ats/score') },
        { href: '/ats/optimize', label: 'ATS Optimizer', icon: <SparklesIcon className="h-5 w-5" />, current: pathname.startsWith('/ats/optimize') },
      ]
    },
    {
      title: 'CREATE',
      items: [
        { href: '/cover-letter', label: 'Cover Letter', icon: <DocumentDuplicateIcon className="h-5 w-5" />, current: pathname.startsWith('/cover-letter') },
        { href: '/ai-demo', label: 'AI Demo', icon: <Squares2X2Icon className="h-5 w-5" />, current: pathname.startsWith('/ai-demo') },
      ]
    }
  ];

  return (
    <aside className="flex flex-col h-[calc(100vh-4rem)] bg-[--sidebar-bg] text-[--sidebar-text] px-4 pt-6 pb-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
          <SparklesIcon className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          Resume AI
        </h2>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 mb-8">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            <h3 className="text-xs uppercase tracking-widest text-[--text-muted] mb-2">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[--sidebar-hover] transition-colors duration-200 ${
                    item.current
                      ? 'bg-[--sidebar-active]/20 text-[--sidebar-active] font-medium'
                      : ''
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px bg-[--border] mb-6"></div>

      {/* User Profile */}
      <div className="flex items-center gap-3 pt-4">
        <div className="h-10 w-10 rounded-full bg-[--bg-surface]/10 flex items-center justify-center">
          <UserIcon className="h-5 w-5 text-[--sidebar-text]" />
        </div>
        <div>
          <p className="text-[--text-secondary] font-medium">User Name</p>
          <p className="text-xs text-[--text-muted]">
            <Link href="/settings" className="hover:underline">Settings</Link>
          </p>
        </div>
      </div>
    </aside>
  );
}