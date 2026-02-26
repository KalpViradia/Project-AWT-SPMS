'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// ─── Admin: Generate a reset token for a user ───
export async function generateResetToken(userId: number, userRole: string) {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'admin') {
        throw new Error("Unauthorized — admin only")
    }

    const token = crypto.randomBytes(48).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.password_reset.create({
        data: {
            token,
            user_id: userId,
            user_role: userRole,
            expires_at: expiresAt,
        }
    })

    return { token }
}

// ─── Public: Validate reset token ───
export async function validateResetToken(token: string) {
    const record = await prisma.password_reset.findUnique({
        where: { token },
    })

    if (!record) return { valid: false, error: "Invalid reset link." }
    if (record.used) return { valid: false, error: "This reset link has already been used." }
    if (record.expires_at < new Date()) return { valid: false, error: "This reset link has expired." }

    return { valid: true, userId: record.user_id, userRole: record.user_role }
}

// ─── Public: Reset password using token ───
export async function resetPassword(token: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters.")
    }

    const record = await prisma.password_reset.findUnique({
        where: { token },
    })

    if (!record || record.used || record.expires_at < new Date()) {
        throw new Error("Invalid or expired reset link.")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    if (record.user_role === 'student') {
        await prisma.student.update({
            where: { student_id: record.user_id },
            data: { password: hashedPassword, modified_at: new Date() },
        })
    } else {
        await prisma.staff.update({
            where: { staff_id: record.user_id },
            data: { password: hashedPassword, modified_at: new Date() },
        })
    }

    // Mark token as used
    await prisma.password_reset.update({
        where: { token },
        data: { used: true },
    })

    return { success: true }
}
