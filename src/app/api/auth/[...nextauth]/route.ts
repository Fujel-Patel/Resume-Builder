import NextAuth from "next-auth";
// GoogleProvider removed – OAuth via Google is disabled.
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // No external OAuth providers configured.
    // Add additional providers here as needed.
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        // @ts-ignore – augment session type with id
        session.user.id = token.sub;
      }
      return session;
    },
    // Optional: Add debugging for auth errors in development
    async jwt({ token, user, account, profile, isNewUser }: any) {
      if (process.env.NODE_ENV === 'development') {
        // Debug logging for auth events
        if (user) token.id = user.id;
        if (account) token.accessToken = account.access_token;
      }
      return token;
    }
  },
};

export const GET = async (req: Request) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[NextAuth] ${req.method} ${new URL(req.url).pathname}`);
  }
  return (NextAuth as any)(req, authOptions).GET(req);
};

export const POST = async (req: Request) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[NextAuth] ${req.method} ${new URL(req.url).pathname}`);
  }
  return (NextAuth as any)(req, authOptions).POST(req);
};
