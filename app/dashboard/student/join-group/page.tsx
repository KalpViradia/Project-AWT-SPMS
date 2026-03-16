import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import { createGroup } from "@/lib/actions"
import { InvitationsList } from "@/components/student/invitations-list"
import { ProposalForm } from "@/components/student/proposal-form"

export default async function JoinGroupPage() {
    const session = await auth()
    if (!session || (session.user as any).role !== 'student') {
        redirect('/', RedirectType.replace)
    }

    const studentEmail = session.user?.email

    // Fetch pending invitations
    let invitations: any[] = [];
    if (studentEmail) {
        invitations = await prisma.project_invitation.findMany({
            where: {
                invited_student_email: studentEmail,
                status: 'pending'
            },
            include: {
                project_group: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }

    // CREATE GROUP FORM data
    const projectTypes = await prisma.project_type.findMany()
    const facultyList = await prisma.staff.findMany({
        where: { role: 'faculty' },
        select: { staff_id: true, staff_name: true, skills: true }
    })

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create or Join a Group</h1>
                    <p className="text-muted-foreground">Submit a project proposal to create a new group, or accept an invitation to join an existing one.</p>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight">Your Invitations</h2>
                <InvitationsList invitations={invitations} />
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h2 className="text-2xl font-semibold tracking-tight">Submit New Proposal</h2>
                <ProposalForm
                    projectTypes={projectTypes}
                    guides={facultyList}
                    action={createGroup}
                />
            </div>
        </div>
    )
}
