
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, FileText, Calendar, PlusCircle } from "lucide-react"

export default async function StudentDashboard() {
    const session = await auth()

    if (!session || (session.user as any).role !== 'student') {
        redirect('/', RedirectType.replace)
    }

    const studentId = parseInt((session.user as any).id)

    // Fetch student's group details
    const studentWithGroup = await prisma.student.findUnique({
        where: { student_id: studentId },
        include: {
            project_group_member: {
                include: {
                    project_group: true
                }
            }
        }
    })

    const groupMember = studentWithGroup?.project_group_member[0]
    const group = groupMember?.project_group

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Project Group
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{group ? group.project_group_name : "Not in a Group"}</div>
                        <p className="text-xs text-muted-foreground">
                            {group ? "Active Project" : "Please join or create a group"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Weekly Reports
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Pending submissions
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Upcoming Reviews
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Scheduled
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-4">
                            {group ? (
                                <>
                                    <p>Project: {group.project_title}</p>
                                    <p>Guide: {group.guide_staff_name || "Not Assigned"}</p>
                                </>
                            ) : (
                                <>
                                    <p>You are not currently part of any project group.</p>
                                    <Button asChild>
                                        <Link href="/dashboard/student/my-group">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Create or Join Group
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Your recent notifications and updates.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground text-center py-8">
                            No recent activity.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
