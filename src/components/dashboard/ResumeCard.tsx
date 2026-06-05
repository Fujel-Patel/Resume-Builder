import Link from 'next/link';
import Button from '@/components/ui/Button';

interface Resume {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  templateId: string | null;
}

export default function ResumeCard({ resume }: { resume: Resume }) {
  return (
    <div className="relative bg-[--bg-surface] border border-[--border] rounded-2xl p-5 flex flex-col h-72 hover:scale-[1.02] hover:shadow-md transition-all duration-200">
      {/* Template color preview strip */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-l-2xl"></div>

      <div className="flex-1 pl-5">
        <h3 className="text-lg font-semibold mb-2 text-[--text-primary]">{resume.title}</h3>
        <p className="text-sm text-[--text-muted] mb-4">
          Created: {new Date(resume.createdAt).toLocaleDateString()}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <Link
            href={`/builder?draftId=${resume.id}`}
            className="text-[--color-primary] hover:underline font-medium"
          >
            Edit Resume
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="border-0 bg-transparent text-[--color-danger] hover:bg-transparent hover:underline px-0 py-0"
            onClick={() => {
              // Placeholder for delete functionality
              alert('Delete functionality not implemented yet');
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}