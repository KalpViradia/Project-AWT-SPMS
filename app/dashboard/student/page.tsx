
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, FileText, Calendar, PlusCircle } from "lucide-react"
import { getActivityLogs, ActivityEvent } from "@/lib/activity-actions"
import { ActivityTimeline } from "@/components/shared/activity-timeline"

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

    const memberships = studentWithGroup?.project_group_member || []

    // Fetch activities for all groups
    const activitiesPromises = memberships.map(m => getActivityLogs(m.project_group_id, 5))
    const groupActivities = await Promise.all(activitiesPromises)
    const allActivities: ActivityEvent[] = groupActivities.flat().sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10)

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Project Groups
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{memberships.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Active Projects
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
                        <CardTitle>My Projects Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-6 space-y-4">
                        {memberships.length > 0 ? (
                            memberships.map((membership) => {
                                const group = membership.project_group;
                                return (
                                    <div key={group.project_group_id} className="border-b last:border-0 pb-4 last:pb-0 mb-4 last:mb-0">
                                        <div className="font-semibold mb-1">{group.project_group_name}</div>
                                        <p className="text-sm text-foreground">Title: {group.project_title}</p>
                                        <p className="text-sm text-muted-foreground">Guide: {group.guide_staff_name || "Not Assigned"}</p>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-4">
                                <p>You are not currently part of any project group.</p>
                                <Button asChild>
                                    <Link href="/dashboard/student/join-group">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Create or Join Group
                                    </Link>
                                </Button>
                            </div>
                        )}
                        {memberships.length > 0 && (
                            <Button asChild variant="outline" className="w-full mt-4">
                                <Link href="/dashboard/student/join-group">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Join Another Group
                                </Link>
                            </Button>
                        )}
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
                        <ActivityTimeline events={allActivities} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
