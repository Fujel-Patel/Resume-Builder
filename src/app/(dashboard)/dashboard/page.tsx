import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ResumeCard from '@/components/dashboard/ResumeCard';
import StatsBar from '@/components/dashboard/StatsBar';
import { SparklesIcon, DocumentTextIcon, Squares2X2Icon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

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

  // Placeholder counts for other stats (in a real app, these would come from the database)
  const templatesCount = 8; // Placeholder
  const atsReportsCount = 0; // Placeholder
  const coverLettersCount = 0; // Placeholder

  return (
    <div className="space-y-6">
      {/* Gradient Hero Banner */}
      <div className="relative bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-20"></div>
        <div className="relative px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome back 👋
          </h1>
          <p className="text-white/90 max-w-xl mx-auto">
            Your AI-powered resume assistant. Build, optimize, and land your dream job.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/builder"
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-200"
            >
              <SparklesIcon className="h-4 w-4" />
              Build Resume
            </Link>
            <Link
              href="/cover-letter"
              className="flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-200"
            >
              Write Cover Letter
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <StatsBar
        stats={[
          { label: 'Resumes', count: resumes.length, icon: DocumentTextIcon, trend: null },
          { label: 'Templates', count: templatesCount, icon: Squares2X2Icon, trend: null },
          { label: 'ATS Reports', count: atsReportsCount, icon: MagnifyingGlassIcon, trend: null },
          { label: 'Cover Letters', count: coverLettersCount, icon: ChatBubbleLeftRightIcon, trend: null }
        ]}
      />

      {/* Resume Section */}
      <section>
        <h2 className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent font-bold text-2xl mb-4">
          Your Resumes
        </h2>
        {resumes.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="text-center py-12">
            {/* Illustration placeholder - we can use a simple graphic or emoji for now */}
            <div className="mb-6">
              <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center mb-3">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <p className="text-[--text-secondary] mb-4">
                You have no resumes yet. Create one from the builder.
              </p>
              <Link
                href="/builder"
                className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-indigo-500/25"
              >
                Build Your First Resume
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}