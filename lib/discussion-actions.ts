'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notification-actions"
import { emitDiscussionMessage } from "@/lib/socket-emitter"

// ─── Get messages for a group ───
export async function getDiscussionMessages(projectGroupId: number) {
    return prisma.discussion_message.findMany({
        where: { project_group_id: projectGroupId },
        orderBy: { created_at: 'asc' },
        take: 100,
    })
}

// ─── Send a message ───
export async function sendDiscussionMessage(formData: FormData) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    const user = session.user as { id: string; role?: string | null; name?: string | null }
    const content = formData.get('content') as string
    const groupIdStr = formData.get('projectGroupId') as string

    if (!content?.trim()) throw new Error("Message cannot be empty.")
    if (!groupIdStr) throw new Error("Project group ID required.")

    const projectGroupId = parseInt(groupIdStr)
    const senderId = parseInt(user.id)
    const senderRole = user.role || 'student'

    const created = await prisma.discussion_message.create({
        data: {
            project_group_id: projectGroupId,
            sender_id: senderId,
            sender_role: senderRole,
            content: content.trim(),
        },
    })

    // Broadcast via WebSocket to all clients in the group room
    emitDiscussionMessage(projectGroupId, {
        message_id: created.message_id,
        sender_id: senderId,
        sender_role: senderRole,
        content: content.trim(),
        created_at: created.created_at,
    })

    // Notify other group members (non-blocking)
    try {
        const members = await prisma.project_group_member.findMany({
            where: { project_group_id: projectGroupId },
        })
        for (const member of members) {
            if (member.student_id !== senderId || senderRole !== 'student') {
                await createNotification({
                    userId: member.student_id,
                    userRole: 'student',
                    title: 'New Discussion Message',
                    message: `${user.name || 'Someone'} sent a message in the group discussion.`,
                    link: `/dashboard/student/discussion`,
                })
            }
        }
    } catch (e) { /* notification failure should not break main action */ }

    revalidatePath('/dashboard/student/discussion')
    revalidatePath('/dashboard/faculty/discussion')
}

// ─── Get groups the user belongs to (for faculty) ───
export async function getFacultyGroups() {
    const session = await auth()
    if (!session?.user) return []

    const user = session.user as { id: string; role?: string | null }
    const staffId = parseInt(user.id)

    return prisma.project_group.findMany({
        where: { guide_staff_id: staffId },
        select: {
            project_group_id: true,
            project_group_name: true,
            project_title: true,
        },
        orderBy: { project_group_name: 'asc' },
    })
}

// ─── Get student's group id ───
export async function getStudentGroupId() {
    const session = await auth()
    if (!session?.user) return null

    const user = session.user as { id: string; role?: string | null }
    const studentId = parseInt(user.id)

    const membership = await prisma.project_group_member.findFirst({
        where: { student_id: studentId },
        include: {
            project_group: {
                select: {
                    project_group_id: true,
                    project_group_name: true,
                },
            },
        },
    })

    return membership
        ? { groupId: membership.project_group.project_group_id, groupName: membership.project_group.project_group_name }
        : null
}
