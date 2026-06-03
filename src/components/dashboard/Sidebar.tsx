import Link from 'next/link';
import {
  HomeIcon,
  PencilIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <HomeIcon className="h-5 w-5" /> },
    { href: '/builder', label: 'Resume Builder', icon: <PencilIcon className="h-5 w-5" /> },
    { href: '/jd/parse', label: 'JD Keywords', icon: <MagnifyingGlassIcon className="h-5 w-5" /> },
    { href: '/ats/score', label: 'ATS Score', icon: <DocumentTextIcon className="h-5 w-5" /> },
    { href: '/ats/optimize', label: 'ATS Optimizer', icon: <SparklesIcon className="h-5 w-5" /> },
    { href: '/cover-letter', label: 'Cover Letter', icon: <Squares2X2Icon className="h-5 w-5" /> },
    { href: '/ai-demo', label: 'AI Demo', icon: <DocumentDuplicateIcon className="h-5 w-5" /> },
  ];

  return (
    <nav className="flex flex-col gap-2 p-4 bg-gray-50 h-full">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-colors"
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}