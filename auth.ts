
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function getUser(email: string, userType: 'student' | 'staff') {
    try {
        if (userType === 'student') {
            const user = await prisma.student.findUnique({ where: { email } });
            return user ? { ...user, type: 'student' } : null;
        } else {
            const user = await prisma.staff.findUnique({ where: { email } });
            return user ? { ...user, type: 'staff' } : null;
        }
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6), role: z.enum(['student', 'faculty', 'admin']) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password, role } = parsedCredentials.data;
          
          const userType: 'student' | 'staff' = role === 'student' ? 'student' : 'staff';
          const user = await getUser(email, userType);

          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
             // Return user object compatible with NextAuth
             // Check if user role matches requested role for admin login security
             if (role === 'admin' && (user as any).role !== 'admin') {
                 return null;
             }

             return {
                 id: userType === 'student' ? (user as any).student_id.toString() : (user as any).staff_id.toString(),
                 name: userType === 'student' ? (user as any).student_name : (user as any).staff_name,
                 email: user.email,
                 role: (user as any).role,
             };
          }
        }
        
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
})
