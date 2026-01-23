import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import { eachDayOfInterval, endOfMonth, format, getDay, isToday, startOfMonth } from "date-fns"
import { ScheduleMeetingDialog } from "@/components/faculty/schedule-meeting-dialog"

import { EditMeetingDialog } from "@/components/faculty/edit-meeting-dialog"
import { AttendanceDialog } from "@/components/faculty/attendance-dialog"

export default async function FacultySchedulePage() {
    const session = await auth()
    if (!session || !session.user) {
        redirect('/', RedirectType.replace)
    }

    const user = session.user as { id: string; role?: string | null }

    if (user.role !== 'faculty') {
        redirect('/', RedirectType.replace)
    }

    const staffId = parseInt(user.id)

    // Fetch meetings
    const meetings = await prisma.project_meeting.findMany({
        where: { guide_staff_id: staffId },
        include: {
            project_group: {
                include: {
                    project_group_member: {
                        include: {
                            student: true
                        }
                    }
                }
            }
        },
        orderBy: {
            meeting_datetime: 'asc'
        }
    })

    // Fetch groups for the select dropdown
    const groups = await prisma.project_group.findMany({
        where: { guide_staff_id: staffId }
    })

    // Fetch distinct locations for autocomplete
    const distinctLocations = await prisma.project_meeting.findMany({
        where: { guide_staff_id: staffId, meeting_location: { not: null } },
        select: { meeting_location: true },
        distinct: ['meeting_location']
    });

    const existingLocations = distinctLocations
        .map(l => l.meeting_location)
        .filter((l): l is string => l !== null);

    // Build a simple month view for the current month using the meetings list
    const today = new Date()
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const firstWeekday = getDay(monthStart) // 0 (Sun) - 6 (Sat)

    // Group meetings by date string for quick lookup
    const meetingsByDate: Record<string, number> = {}
    for (const meeting of meetings) {
        const key = format(new Date(meeting.meeting_datetime), 'yyyy-MM-dd')
        meetingsByDate[key] = (meetingsByDate[key] ?? 0) + 1
    }

    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
                    <p className="text-muted-foreground">Manage project group meetings.</p>
                </div>
                <ScheduleMeetingDialog groups={groups} existingLocations={existingLocations} />
            </div>

            {/* Calendar-style monthly overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Monthly Overview</CardTitle>
                    <CardDescription>
                        Meetings for the current month at a glance.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="grid grid-cols-7 text-xs text-muted-foreground mb-1">
                        {weekdayLabels.map((label) => (
                            <div key={label} className="flex items-center justify-center h-6">
                                {label}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-xs">
                        {/* Leading empty cells before the first day of the month */}
                        {Array.from({ length: firstWeekday }).map((_, index) => (
                            <div key={`empty-${index}`} />
                        ))}
                        {monthDays.map((day) => {
                            const key = format(day, 'yyyy-MM-dd')
                            const count = meetingsByDate[key] ?? 0
                            const hasMeetings = count > 0
                            const todayFlag = isToday(day)

                            return (
                                <div key={key} className="flex flex-col items-center justify-center py-1">
                                    <div
                                        className={
                                            `flex h-7 w-7 items-center justify-center rounded-full ` +
                                            (hasMeetings
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground') +
                                            (todayFlag ? ' ring-1 ring-primary' : '')
                                        }
                                    >
                                        {format(day, 'd')}
                                    </div>
                                    {hasMeetings && (
                                        <span className="mt-0.5 text-[10px] text-muted-foreground">
                                            {count} meeting{count > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {meetings.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8 text-muted-foreground">
                                No meetings scheduled.
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {meetings.map((meeting) => {
                            const isPast = new Date(meeting.meeting_datetime) < new Date();
                            // Collect students for attendance (from group members)
                            const groupStudents = meeting.project_group.project_group_member.map(m => m.student);

                            return (
                                <Card key={meeting.project_meeting_id}>
                                    <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-medium">
                                                {meeting.project_group.project_group_name}
                                            </CardTitle>
                                            <CardDescription>
                                                {meeting.meeting_status}
                                            </CardDescription>
                                        </div>
                                        <EditMeetingDialog meeting={meeting} />
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-sm">
                                        <div className="space-y-2">
                                            <div className="flex items-center text-muted-foreground">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {format(new Date(meeting.meeting_datetime), "PPP")}
                                            </div>
                                            <div className="flex items-center text-muted-foreground">
                                                <Clock className="mr-2 h-4 w-4" />
                                                {format(new Date(meeting.meeting_datetime), "p")}
                                            </div>
                                            {meeting.meeting_location && (
                                                <div className="flex items-center text-muted-foreground">
                                                    <span className="mr-2 h-4 w-4 text-center font-bold">@</span>
                                                    {meeting.meeting_location}
                                                </div>
                                            )}
                                        </div>
                                        {isPast && (
                                            <AttendanceDialog
                                                meetingId={meeting.project_meeting_id}
                                                students={groupStudents}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
