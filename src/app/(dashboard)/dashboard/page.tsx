import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ResumeCard from '@/components/dashboard/ResumeCard';
import StatsBar from '@/components/dashboard/StatsBar';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  // Authentication removed – page is publicly accessible.

  let resumes: Array<{
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    templateId: string | null;
  }> = [];

  try {
    resumes = await prisma.resume.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        templateId: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    console.debug('Dashboard data unavailable, rendering empty state.', e);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Dashboard</h1>
      <StatsBar resumesCount={resumes.length} templatesCount={8} />
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Resumes</h2>
        {resumes.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((r) => (
              <ResumeCard
                key={r.id}
                resume={{
                  ...r,
                  createdAt: r.createdAt.toISOString(),
                  updatedAt: r.updatedAt.toISOString(),
                }}
              />
            ))}
          </div>
        ) : (
          <>
              <p className="text-gray-500">You have no resumes yet. Create one from the builder.</p>
              <Link href="/cover-letter" className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                Generate Cover Letter
              </Link>
            </>
        )}
      </section>
    </div>
  );
}
