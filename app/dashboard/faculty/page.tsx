
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import Link from "next/link"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, BookCheck, AlertCircle, ArrowRight } from "lucide-react"

export default async function FacultyDashboard() {
    const session = await auth()
    if (!session || !session.user) {
        redirect('/', RedirectType.replace)
    }

    const user = session.user as { id: string; name?: string | null; role?: string | null }

    if (user.role !== 'faculty') {
        redirect('/', RedirectType.replace)
    }

    const staffId = parseInt(user.id)
    const staffName = user.name

    // Fetch stats
    const groupsCount = await prisma.project_group.count({
        where: { guide_staff_id: staffId }
    })

    const upcomingMeetings = await prisma.project_meeting.count({
        where: {
            guide_staff_id: staffId,
            meeting_datetime: {
                gte: new Date()
            }
        }
    })

    // Fetch groups for list
    const groups = await prisma.project_group.findMany({
        where: { guide_staff_id: staffId },
        include: {
            project_type: true
        },
        take: 5
    })

    // Pending reviews: weekly reports for this faculty's groups that are still marked as 'pending'
    const pendingReviews = await prisma.weekly_report.count({
        where: {
            project_group: {
                guide_staff_id: staffId
            },
            status: 'pending'
        }
    })


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, {staffName}.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/faculty/groups">View All Groups</Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            My Groups
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{groupsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Active project groups
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Reviews
                        </CardTitle>
                        <BookCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingReviews}</div>
                        <p className="text-xs text-muted-foreground">
                            Weekly reports awaiting your feedback
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Upcoming Meetings
                        </CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingMeetings}</div>
                        <p className="text-xs text-muted-foreground">
                            Scheduled
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Action Items
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            System alerts
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>
                            Your project groups status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {groups.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4">No groups assigned yet.</p>
                            ) : (
                                groups.map((group) => (
                                    <div key={group.project_group_id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">{group.project_group_name}</p>
                                            <p className="text-sm text-muted-foreground">{group.project_title}</p>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {group.project_type.project_type_name}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Management</CardTitle>
                        <CardDescription>
                            Quick access to management tasks.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Button variant="outline" className="w-full justify-between" asChild>
                            <Link href="/dashboard/faculty/reviews">
                                Review Recent Reports <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-between" asChild>
                            <Link href="/dashboard/faculty/schedule">
                                Schedule Group Meeting <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
