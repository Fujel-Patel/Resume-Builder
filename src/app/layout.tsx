import '@/app/globals.css';
import type { ReactNode } from 'react';
import ThemeProvider from '@/components/shared/ThemeProvider';
import { ToastProvider } from '@/components/ui/ToastProvider';

export const metadata = {
  title: {
    default: 'Resume AI — AI-Powered Resume Builder & ATS Optimizer',
    template: '%s | Resume AI',
  },
  description:
    'Build, optimize, and export professional resumes with AI. ATS-friendly templates, real-time scoring, and cover letter generation.',
  keywords: [
    'resume builder',
    'ATS optimizer',
    'AI resume',
    'cover letter generator',
    'resume templates',
    'job application',
  ],
  authors: [{ name: 'Resume AI' }],
  openGraph: {
    title: 'Resume AI — AI-Powered Resume Builder',
    description:
      'Build, optimize, and export professional resumes with AI. ATS-friendly templates, real-time scoring, and cover letter generation.',
    url: 'https://resume-ai.example.com',
    siteName: 'Resume AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume AI — AI-Powered Resume Builder',
    description:
      'Build, optimize, and export professional resumes with AI. ATS-friendly templates, real-time scoring, and cover letter generation.',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
      </body>
    </html>
  );
}
