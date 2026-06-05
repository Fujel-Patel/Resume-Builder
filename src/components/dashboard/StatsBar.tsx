import { DocumentTextIcon, Squares2X2Icon, MagnifyingGlassIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface StatCardProps {
  label: string;
  count: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | null;
}

export default function StatsBar({
  stats = [
    { label: 'Resumes', count: 0, icon: DocumentTextIcon, trend: null },
    { label: 'Templates', count: 0, icon: Squares2X2Icon, trend: null },
    { label: 'ATS Reports', count: 0, icon: MagnifyingGlassIcon, trend: null },
    { label: 'Cover Letters', count: 0, icon: ChatBubbleLeftRightIcon, trend: null }
  ]
}: { stats?: StatCardProps[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-[--bg-surface] border border-[--border] rounded-2xl p-4 flex flex-col items-center hover:shadow-md transition-shadow duration-200">
          <div className="mb-3">
            <stat.icon className="h-6 w-6 text-[--color-primary] mb-2" />
          </div>
          <p className="text-xs uppercase tracking-widest text-[--text-muted] mb-1">
            {stat.label}
          </p>
          <p className="text-2xl font-bold text-[--text-primary] mb-2">
            {stat.count}
          </p>
          {stat.trend && (
            <div className={`flex items-center gap-1 text-sm ${
              stat.trend === 'up' ? 'text-[--color-success]' : 'text-[--color-danger]'
            }`}>
              {stat.trend === 'up' ? '▲' : '▼'}
              <span>{Math.abs(Math.round(Math.random() * 10))}%</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}