import React from "react";
import CoverLetterForm from "@/components/cover-letter/CoverLetterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cover Letter Generator",
};

export default function CoverLetterPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <CoverLetterForm />
      </div>
    </div>
  );
}
