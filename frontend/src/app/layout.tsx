import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { ReduxProvider } from "@/providers/redux-provider";
import { Toaster } from "@/components/ui/sonner";
import { UnauthorizedOverlay } from "@/components/auth/unauthorized-overlay";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Generative-CV",
  description: "Build ATS-Friendly Resumes With AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          <ThemeProvider>
            {children}
            <Toaster />
            <UnauthorizedOverlay />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
