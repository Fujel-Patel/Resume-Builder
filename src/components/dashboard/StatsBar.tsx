interface StatsBarProps {
  resumesCount?: number;
  templatesCount?: number;
}

export default function StatsBar({ resumesCount = 0, templatesCount = 0 }: StatsBarProps) {
  return (
    <div className="flex space-x-4 mb-6">
      <div className="p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-500">Resumes</p>
        <p className="text-xl font-bold" data-testid="resumes-count">{resumesCount}</p>
      </div>
      <div className="p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-500">Templates</p>
        <p className="text-xl font-bold" data-testid="templates-count">{templatesCount}</p>
      </div>
    </div>
  );
}
