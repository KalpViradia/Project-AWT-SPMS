import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AssignGuideDialog } from "@/components/student/assign-guide-dialog"
import { InviteMemberDialog } from "@/components/student/invite-member-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileText } from "lucide-react"
import { UploadDocumentDialog } from "@/components/student/upload-document-dialog"
import { DocumentsList } from "@/components/shared/documents-list"
import { ProposalStatusBadge } from "@/components/student/proposal-status-badge"
import { FeedbackDisplay } from "@/components/shared/feedback-display"
import Link from "next/link"

export default async function MyGroupPage() {
    const session = await auth()
    if (!session || (session.user as any).role !== 'student') {
        redirect('/', RedirectType.replace)
    }

    const studentId = parseInt((session.user as any).id)
    const studentEmail = session.user?.email

    // Fetch existing groups
    const memberships = await prisma.project_group_member.findMany({
        where: { student_id: studentId },
        orderBy: {
            project_group: {
                created_at: 'desc'
            }
        },
        include: {
            project_group: {
                include: {
                    project_type: true,
                    staff_project_group_guide_staff_idTostaff: true,
                    project_group_member: {
                        include: {
                            student: true
                        }
                    },
                    weekly_report: {
                        orderBy: { week_number: 'desc' },
                        take: 1
                    },
                    project_meeting: {
                        orderBy: { meeting_datetime: 'desc' },
                        take: 1
                    },
                    project_document: {
                        orderBy: { uploaded_at: 'desc' }
                    },
                    proposal_feedback: {
                        include: { staff: { select: { staff_name: true } } },
                    },
                }
            }
        }
    })

    const hasGroups = memberships.length > 0;

    const facultyList = await prisma.staff.findMany({
        where: { role: 'faculty' },
        select: { staff_id: true, staff_name: true, skills: true }
    })

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Groups</h1>
                    <p className="text-muted-foreground">Manage your project groups and members.</p>
                </div>
            </div>

            {hasGroups && (
                <div className="space-y-12">
                    {memberships.map((membership) => {
                        const group = membership.project_group;
                        const isLeader = membership.is_group_leader;

                        return (
                            <div key={group.project_group_id} className="flex flex-col gap-6 pt-4 border-t first:border-t-0 first:pt-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight">{group.project_group_name}</h2>
                                    </div>
                                    <div className="flex gap-2">
                                        {isLeader && (
                                            <>
                                                <InviteMemberDialog groupId={group.project_group_id} />
                                                {!group.guide_staff_id && (
                                                    <AssignGuideDialog
                                                        groupId={group.project_group_id}
                                                        facultyList={facultyList}
                                                        projectSkills={group.project_skills || []}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {group.status === 'pending' && (
                                    <Alert variant="warning">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Pending Approval</AlertTitle>
                                        <AlertDescription>
                                            Your project proposal is currently pending approval from your guide. Some features may be limited until approved.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {group.status === 'rejected' && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Proposal Rejected</AlertTitle>
                                        <AlertDescription>
                                            {group.rejection_reason || "Your project proposal has been rejected. Please contact your guide for more information."}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {group.status === 'approved' && (
                                    <Alert variant="success">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Proposal Approved</AlertTitle>
                                        <AlertDescription>
                                            Your project proposal has been approved. You can now proceed with your project work.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {group.proposal_feedback?.[0] && (
                                    <FeedbackDisplay feedback={group.proposal_feedback[0]} />
                                )}

                                <div className="grid gap-6 md:grid-cols-2">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle>Group Information</CardTitle>
                                            <ProposalStatusBadge status={group.status} />
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <div className="text-muted-foreground">Project Title</div>
                                                    <div className="font-medium">{group.project_title}</div>
                                                </div>
                                                <div>
                                                    <div className="text-muted-foreground">Project Type</div>
                                                    <div className="font-medium">{group.project_type.project_type_name}</div>
                                                </div>
                                                <div>
                                                    <div className="text-muted-foreground">Guide</div>
                                                    <div className="font-medium">
                                                        {group.staff_project_group_guide_staff_idTostaff?.staff_name || "Not Assigned"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-muted-foreground">Submitted</div>
                                                    <div className="font-medium">
                                                        {group.proposal_submitted_at ? new Date(group.proposal_submitted_at).toLocaleDateString() : group.created_at.toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            {group.project_skills && group.project_skills.length > 0 && (
                                                <div className="pt-4 border-t">
                                                    <div className="text-muted-foreground text-sm mb-2">Project Skills</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {group.project_skills.map((skill: string, i: number) => (
                                                            <Badge key={i} variant="outline">{skill}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {(group.project_objectives || group.project_description) && (
                                                <div className="pt-4 border-t">
                                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                                        <Link href={`/dashboard/student/project-details`}>
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            View Project Details
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Members</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-4">
                                                {group.project_group_member.map((member) => (
                                                    <li key={member.student_id} className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={member.student.avatar_url || ""} alt={member.student.student_name} />
                                                                <AvatarFallback>
                                                                    {member.student.student_name.charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-sm font-medium leading-none">{member.student.student_name}</p>
                                                                <p className="text-xs text-muted-foreground">{member.student.email}</p>
                                                            </div>
                                                        </div>
                                                        {member.is_group_leader && (
                                                            <Badge variant="secondary">Leader</Badge>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                    <Card className="md:col-span-2">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle>Documents</CardTitle>
                                            <UploadDocumentDialog groupId={group.project_group_id} />
                                        </CardHeader>
                                        <CardContent>
                                            <DocumentsList documents={group.project_document} userRole="student" />
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {!hasGroups && (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-4 border rounded-lg min-h-[300px]">
                    <p>You are not currently part of any project group.</p>
                    <Button asChild>
                        <Link href="/dashboard/student/join-group">
                            Create or Join a Group
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
