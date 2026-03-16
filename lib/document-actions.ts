'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notification-actions"

// ─── Update Document Status (Faculty) ───
export async function updateDocumentStatus(formData: FormData) {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'faculty') {
        throw new Error("Unauthorized: Only faculty can review documents.")
    }

    const documentId = parseInt(formData.get("documentId") as string)
    const status = formData.get("status") as string
    const feedback = formData.get("feedback") as string || ""

    const doc = await prisma.project_document.update({
        where: { document_id: documentId },
        data: {
            status,
            feedback,
            modified_at: new Date(),
        },
        include: {
            project_group: {
                include: {
                    project_group_member: true
                }
            }
        }
    })

    // Notify all group members
    for (const member of doc.project_group.project_group_member) {
        await createNotification({
            userId: member.student_id,
            userRole: 'student',
            title: 'Document Status Updated',
            message: `The status of "${doc.title}" has been updated to "${status}".`,
            link: '/dashboard/student/my-group',
        })
    }

    revalidatePath(`/dashboard/faculty/groups/${doc.project_group_id}`)
    revalidatePath('/dashboard/student/my-group')
    return { success: true }
}

// ─── Replace Document (Student) ───
// This is actually handled by the existing uploadDocument logic if we modify it to handle updates,
// but let's make a dedicated one for clarity if needed. Or just reuse uploadDocument with a docId.
