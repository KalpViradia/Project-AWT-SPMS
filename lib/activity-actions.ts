import { prisma } from "@/lib/prisma"

export type ActivityType = "report" | "meeting" | "document" | "message" | "milestone" | "task"

export interface ActivityEvent {
    id: string
    type: ActivityType
    title: string
    description: string
    date: Date
    userName?: string
}

export async function getActivityLogs(projectGroupId: number, limit = 10): Promise<ActivityEvent[]> {
    const events: ActivityEvent[] = []

    // 1. Reports
    const reports = await prisma.weekly_report.findMany({
        where: { project_group_id: projectGroupId },
        orderBy: { submission_date: 'desc' },
        take: limit
    })
    reports.forEach(r => {
        events.push({
            id: `report-${r.report_id}`,
            type: "report",
            title: `Report Submitted (Week ${r.week_number})`,
            description: `A new progress report was submitted.`,
            date: new Date(r.submission_date)
        })
    })

    // 2. Meetings
    const meetings = await prisma.project_meeting.findMany({
        where: { project_group_id: projectGroupId },
        orderBy: { meeting_datetime: 'desc' },
        take: limit,
        include: { staff: true }
    })
    meetings.forEach(m => {
        events.push({
            id: `meeting-${m.project_meeting_id}`,
            type: "meeting",
            title: "Meeting Scheduled",
            description: m.meeting_purpose || "Project discussion meeting.",
            date: new Date(m.created_at || m.meeting_datetime),
            userName: m.staff.staff_name
        })
    })

    // 3. Documents
    const docs = await prisma.project_document.findMany({
        where: { project_group_id: projectGroupId },
        orderBy: { uploaded_at: 'desc' },
        take: limit
    })
    docs.forEach(d => {
        events.push({
            id: `doc-${d.document_id}`,
            type: "document",
            title: "Document Uploaded",
            description: d.title,
            date: new Date(d.uploaded_at)
        })
    })

    // 4. Tasks (Recent updates)
    const tasks = await prisma.project_task.findMany({
        where: { project_group_id: projectGroupId },
        orderBy: { modified_at: 'desc' },
        take: limit,
        include: { student: { select: { student_name: true } } }
    })
    tasks.forEach(t => {
        events.push({
            id: `task-${t.task_id}-${t.modified_at.getTime()}`,
            type: "task",
            title: `Task Updated: ${t.title}`,
            description: `Status: ${t.status.replace(/_/g, ' ')}`,
            date: new Date(t.modified_at),
            userName: t.student?.student_name
        })
    })

    // Sort by date descending
    return events.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit)
}
