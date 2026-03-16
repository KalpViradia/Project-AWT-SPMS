
import type { NextAuthConfig } from "next-auth"

import { NextResponse } from 'next/server';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnHome = nextUrl.pathname === '/';

      if (isOnDashboard) {
        if (!isLoggedIn) return false;

        const role = (auth.user as any).role;
        const path = nextUrl.pathname;

        if (path.startsWith('/dashboard/student') && role !== 'student') {
           return NextResponse.redirect(new URL('/unauthorized', nextUrl));
        }
        if (path.startsWith('/dashboard/faculty') && role !== 'faculty') {
           return NextResponse.redirect(new URL('/unauthorized', nextUrl));
        }
        if (path.startsWith('/dashboard/admin') && role !== 'admin') {
           return NextResponse.redirect(new URL('/unauthorized', nextUrl));
        }

        return true;
      } else if (isLoggedIn && (isOnLogin || isOnHome)) {
        const role = (auth.user as any).role;
        if (role === 'student') return NextResponse.redirect(new URL('/dashboard/student', nextUrl));
        if (role === 'faculty') return NextResponse.redirect(new URL('/dashboard/faculty', nextUrl));
        if (role === 'admin') return NextResponse.redirect(new URL('/dashboard/admin', nextUrl));
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    jwt({ token, user, trigger, session }) {
        if (user) {
            token.id = user.id;
            token.role = (user as any).role;
            token.image = (user as any).image;
        }
        if (trigger === "update" && session?.image) {
            token.image = session.image;
        }
        return token;
    },
    session({ session, token }) {
        if (session.user) {
            session.user.id = token.id as string;
            (session.user as any).role = token.role as string;
            session.user.image = token.image as string;
        }
        return session;
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
