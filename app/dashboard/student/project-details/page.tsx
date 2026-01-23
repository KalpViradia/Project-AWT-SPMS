import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProposalStatusBadge } from "@/components/student/proposal-status-badge"
import { Badge } from "@/components/ui/badge"

export default async function ProjectDetailsPage() {
    const session = await auth()
    if (!session || (session.user as any).role !== 'student') {
        redirect('/')
    }

    const studentId = parseInt((session.user as any).id)

    // Fetch student's group with full details
    const membership = await prisma.project_group_member.findFirst({
        where: { student_id: studentId },
        include: {
            project_group: {
                include: {
                    project_type: true,
                    staff_project_group_guide_staff_idTostaff: true,
                    staff_project_group_reviewed_byTostaff: true,
                }
            }
        }
    })

    if (!membership || !membership.project_group) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-muted-foreground">You are not part of any project group.</p>
                <Button asChild>
                    <Link href="/dashboard/student/my-group">Create or Join a Group</Link>
                </Button>
            </div>
        )
    }

    const group = membership.project_group

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/student/my-group">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{group.project_title}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{group.project_type.project_type_name}</Badge>
                        <ProposalStatusBadge status={group.status} />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Project Overview</CardTitle>
                        <CardDescription>Detailed information about your project proposal</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Description</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {group.project_description || "No description provided."}
                            </p>
                        </div>

                        {group.project_objectives && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Objectives</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {group.project_objectives}
                                </p>
                            </div>
                        )}

                        {group.project_methodology && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Methodology</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {group.project_methodology}
                                </p>
                            </div>
                        )}

                        {group.project_expected_outcomes && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Expected Outcomes</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {group.project_expected_outcomes}
                                </p>
                            </div>
                        )}

                        {group.proposal_file_path && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Proposal Document</h3>
                                <Button variant="outline" size="sm" asChild>
                                    <a href={group.proposal_file_path} target="_blank" rel="noopener noreferrer">
                                        Download Proposal
                                    </a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Guide</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {group.staff_project_group_guide_staff_idTostaff ? (
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {group.staff_project_group_guide_staff_idTostaff.staff_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {group.staff_project_group_guide_staff_idTostaff.email}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No guide assigned yet</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Submitted</p>
                                    <p className="text-xs text-muted-foreground">
                                        {group.proposal_submitted_at
                                            ? new Date(group.proposal_submitted_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : new Date(group.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                    </p>
                                </div>
                            </div>

                            {group.proposal_reviewed_at && (
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {group.status === 'approved' ? 'Approved' : 'Reviewed'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(group.proposal_reviewed_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        {group.staff_project_group_reviewed_byTostaff && (
                                            <p className="text-xs text-muted-foreground">
                                                by {group.staff_project_group_reviewed_byTostaff.staff_name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {group.status === 'rejected' && group.rejection_reason && (
                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive">Rejection Reason</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">{group.rejection_reason}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
