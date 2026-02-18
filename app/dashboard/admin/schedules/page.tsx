import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { CalendarDays, MapPin, Users } from "lucide-react"

export default async function AdminSchedulesPage() {
    const session = await auth()
    if (!session || !session.user) redirect("/", RedirectType.replace)
    const userRole = (session.user as { role?: string }).role
    if (userRole !== "admin") redirect("/", RedirectType.replace)

    const meetings = await prisma.project_meeting.findMany({
        include: {
            project_group: true,
            staff: true,
            project_meeting_attendance: true,
        },
        orderBy: { meeting_datetime: "desc" },
    })

    const now = new Date()
    const upcoming = meetings.filter(m => new Date(m.meeting_datetime) >= now)
    const past = meetings.filter(m => new Date(m.meeting_datetime) < now)

    const totalMeetings = meetings.length
    const upcomingCount = upcoming.length
    const pastCount = past.length
    const uniqueGroups = new Set(meetings.map(m => m.project_group_id)).size

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">All Meetings</h1>
                <p className="text-muted-foreground">Overview of all scheduled meetings across all project groups.</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMeetings}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                        <CalendarDays className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pastCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Groups with Meetings</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueGroups}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Meetings */}
            {upcoming.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Badge className="bg-green-500">Upcoming</Badge>
                            {upcomingCount} meeting{upcomingCount !== 1 ? "s" : ""}
                        </CardTitle>
                        <CardDescription>Meetings that haven&apos;t happened yet.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Group</TableHead>
                                        <TableHead>Guide</TableHead>
                                        <TableHead>Purpose</TableHead>
                                        <TableHead>Location</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {upcoming.map(meeting => (
                                        <TableRow key={meeting.project_meeting_id}>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {format(new Date(meeting.meeting_datetime), "PPp")}
                                            </TableCell>
                                            <TableCell>{meeting.project_group.project_group_name}</TableCell>
                                            <TableCell>{meeting.staff.staff_name}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">{meeting.meeting_purpose || "—"}</TableCell>
                                            <TableCell>
                                                {meeting.meeting_location ? (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {meeting.meeting_location}
                                                    </span>
                                                ) : "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Past Meetings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Badge variant="secondary">Past</Badge>
                        {pastCount} meeting{pastCount !== 1 ? "s" : ""}
                    </CardTitle>
                    <CardDescription>Completed meetings with attendance data.</CardDescription>
                </CardHeader>
                <CardContent>
                    {past.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No past meetings found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Group</TableHead>
                                        <TableHead>Guide</TableHead>
                                        <TableHead>Purpose</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Attended</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {past.map(meeting => {
                                        const total = meeting.project_meeting_attendance.length
                                        const present = meeting.project_meeting_attendance.filter(a => a.is_present).length
                                        return (
                                            <TableRow key={meeting.project_meeting_id}>
                                                <TableCell className="font-medium whitespace-nowrap">
                                                    {format(new Date(meeting.meeting_datetime), "PPp")}
                                                </TableCell>
                                                <TableCell>{meeting.project_group.project_group_name}</TableCell>
                                                <TableCell>{meeting.staff.staff_name}</TableCell>
                                                <TableCell className="max-w-[200px] truncate">{meeting.meeting_purpose || "—"}</TableCell>
                                                <TableCell>
                                                    {meeting.meeting_location ? (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {meeting.meeting_location}
                                                        </span>
                                                    ) : "—"}
                                                </TableCell>
                                                <TableCell>
                                                    {total > 0 ? (
                                                        <Badge variant={present === total ? "default" : "secondary"}>
                                                            {present}/{total}
                                                        </Badge>
                                                    ) : "—"}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
