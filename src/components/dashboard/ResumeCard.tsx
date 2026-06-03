import Link from 'next/link';

interface Resume {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  templateId: string | null;
}

export default function ResumeCard({ resume }: { resume: Resume }) {
  return (
    <div className="border rounded p-4 hover:shadow-md">
      <h3 className="text-lg font-semibold mb-1">{resume.title}</h3>
      <p className="text-sm text-gray-600 mb-2">
        Created: {new Date(resume.createdAt).toLocaleDateString()}
      </p>
      <Link
        href={`/builder?draftId=${resume.id}`}
        className="text-blue-600 hover:underline text-sm"
      >
        Edit Resume
      </Link>
    </div>
  );
}
