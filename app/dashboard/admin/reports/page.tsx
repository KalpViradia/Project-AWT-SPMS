import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ReportsExportClient } from "@/components/admin/reports-export-client"

export default async function AdminReportsPage() {
    const session = await auth()

    if (!session || !session.user) {
        redirect("/", RedirectType.replace)
    }

    const userRole = (session.user as { role?: string }).role
    if (userRole !== "admin") {
        redirect("/", RedirectType.replace)
    }

    // Fetch all projects with details
    const projects = await prisma.project_group.findMany({
        include: {
            project_type: true,
            staff_project_group_guide_staff_idTostaff: true,
            department: true,
            academic_year: true,
            project_group_member: {
                include: {
                    student: true,
                },
            },
            project_meeting: {
                include: {
                    project_meeting_attendance: true,
                },
            },
            weekly_report: true,
        },
        orderBy: {
            created_at: "desc",
        },
    })

    // Prepare data for export
    const exportData = projects.map((project) => {
        const totalMeetings = project.project_meeting.length
        const totalAttendance = project.project_meeting.reduce(
            (sum, meeting) =>
                sum + meeting.project_meeting_attendance.filter((a) => a.is_present).length,
            0
        )
        const totalPossibleAttendance =
            project.project_meeting.length * project.project_group_member.length

        const avgAttendance =
            totalPossibleAttendance > 0
                ? Math.round((totalAttendance / totalPossibleAttendance) * 100)
                : 0

        const avgMarks =
            project.weekly_report.length > 0
                ? Math.round(
                    project.weekly_report.reduce((sum, r) => sum + (r.marks || 0), 0) /
                    project.weekly_report.filter((r) => r.marks !== null).length || 0
                )
                : null

        return {
            id: project.project_group_id,
            groupName: project.project_group_name,
            projectTitle: project.project_title,
            projectType: project.project_type.project_type_name,
            guide: project.staff_project_group_guide_staff_idTostaff?.staff_name || "Not Assigned",
            department: project.department?.department_name || "—",
            academicYear: project.academic_year?.year_name || "—",
            status: project.status,
            memberCount: project.project_group_member.length,
            members: project.project_group_member.map((m) => m.student.student_name).join(", "),
            meetingCount: totalMeetings,
            avgAttendance: `${avgAttendance}%`,
            reportCount: project.weekly_report.length,
            avgMarks: avgMarks !== null ? avgMarks.toString() : "—",
            finalMarks: project.final_marks?.toString() || "—",
        }
    })

    const exportColumns = [
        { header: "Group Name", key: "groupName" },
        { header: "Project Title", key: "projectTitle" },
        { header: "Type", key: "projectType" },
        { header: "Guide", key: "guide" },
        { header: "Department", key: "department" },
        { header: "Academic Year", key: "academicYear" },
        { header: "Status", key: "status" },
        { header: "Members", key: "members" },
        { header: "Meetings", key: "meetingCount" },
        { header: "Avg Attendance", key: "avgAttendance" },
        { header: "Reports", key: "reportCount" },
        { header: "Avg Marks", key: "avgMarks" },
        { header: "Final Marks", key: "finalMarks" },
    ]

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground">
                        View all projects and export data to Excel or PDF.
                    </p>
                </div>
                <ReportsExportClient data={exportData} columns={exportColumns} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Projects</CardTitle>
                    <CardDescription>
                        Complete list of all projects with guide, type, members, and progress details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {projects.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No projects found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Group</TableHead>
                                        <TableHead>Project Title</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Guide</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Members</TableHead>
                                        <TableHead>Meetings</TableHead>
                                        <TableHead>Avg Attendance</TableHead>
                                        <TableHead>Final Marks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projects.map((project) => {
                                        const data = exportData.find(
                                            (d) => d.id === project.project_group_id
                                        )!
                                        return (
                                            <TableRow key={project.project_group_id}>
                                                <TableCell className="font-medium">
                                                    {project.project_group_name}
                                                </TableCell>
                                                <TableCell>{project.project_title}</TableCell>
                                                <TableCell>{project.project_type.project_type_name}</TableCell>
                                                <TableCell>
                                                    {project.staff_project_group_guide_staff_idTostaff?.staff_name ||
                                                        "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            project.status === "approved"
                                                                ? "default"
                                                                : project.status === "rejected"
                                                                    ? "destructive"
                                                                    : "secondary"
                                                        }
                                                    >
                                                        {project.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{data.memberCount}</TableCell>
                                                <TableCell>{data.meetingCount}</TableCell>
                                                <TableCell>{data.avgAttendance}</TableCell>
                                                <TableCell>{data.finalMarks}</TableCell>
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
