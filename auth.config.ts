
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnLogin) {
        // Redirect to specific dashboard based on role
        const role = (auth.user as any).role;
        if (role === 'student') return Response.redirect(new URL('/dashboard/student', nextUrl));
        if (role === 'faculty') return Response.redirect(new URL('/dashboard/faculty', nextUrl));
        if (role === 'admin') return Response.redirect(new URL('/dashboard/admin', nextUrl));
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    jwt({ token, user, trigger, session }) {
        if (user) {
            token.id = user.id;
            token.role = (user as any).role;
        }
        return token;
    },
    session({ session, token }) {
        if (session.user) {
            session.user.id = token.id as string;
            (session.user as any).role = token.role as string;
        }
        return session;
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
