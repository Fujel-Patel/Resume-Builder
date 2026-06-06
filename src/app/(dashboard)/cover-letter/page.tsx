import React from "react";
import CoverLetterForm from "@/components/cover-letter/CoverLetterForm";
import type { Metadata } from "next";
import MetaSetter from '@/components/dashboard/MetaSetter';

export const metadata: Metadata = {
  title: "Cover Letter Generator",
};

export default function CoverLetterPage() {
  return (
    <>
      <MetaSetter title="Cover Letter Generator" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'AI Features' }, { label: 'Cover Letter Generator' }]} />
      <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <CoverLetterForm />
      </div>
    </div>
    </>
  );
}
