import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { ExportButtons } from "@/components/shared/export-buttons"
import { SubmitReportForm } from "@/components/student/submit-report-form"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Calendar } from "lucide-react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default async function ReportsPage() {
    const session = await auth()
    if (!session || (session.user as any).role !== 'student') {
        redirect('/', RedirectType.replace)
    }

    const studentId = parseInt((session.user as any).id)

    // Find student's group
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

    if (memberships.length === 0) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">Manage your weekly project reports.</p>
                </div>
                <EmptyState 
                    icon="folder" 
                    title="No Project Group" 
                    description="You need to be in a project group to view and submit reports." 
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Project Reports</h1>
                <p className="text-muted-foreground">Manage your weekly project reports for all your groups.</p>
            </div>

            {memberships.map(async (membership) => {
                const group = membership.project_group;
                const reports = await prisma.weekly_report.findMany({
                    where: { project_group_id: group.project_group_id },
                    orderBy: { week_number: 'desc' }
                })

                const reportExportData = reports.map(r => ({
                    week: r.week_number,
                    date: format(new Date(r.submission_date), "MMM d, yyyy"),
                    status: r.status,
                    content: r.report_content,
                    feedback: r.feedback || "None"
                }))
                const reportExportColumns = [
                    { header: "Week", key: "week" },
                    { header: "Date", key: "date" },
                    { header: "Status", key: "status" },
                    { header: "Content", key: "content" },
                    { header: "Feedback", key: "feedback" },
                ]

                return (
                    <div key={group.project_group_id} className="space-y-6 pt-6 border-t first:border-t-0 first:pt-0">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h2 className="text-2xl font-semibold tracking-tight">{group.project_title}</h2>
                            <div className="flex items-center gap-2">
                                {reports.length > 0 && (
                                    <ExportButtons 
                                        data={reportExportData} 
                                        columns={reportExportColumns} 
                                        filename={`${group.project_group_name}-reports`.replace(/\s+/g, '-')} 
                                        title={`${group.project_group_name} - Reports`} 
                                    />
                                )}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button>Submit New Report</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Submit Weekly Report</DialogTitle>
                                        <DialogDescription>
                                            Submit your progress report for {group.project_title}.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <SubmitReportForm 
                                        groupId={group.project_group_id} 
                                        projectTitle={group.project_title} 
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                        <div className="space-y-4">
                            {reports.length === 0 ? (
                                <EmptyState 
                                    icon="file" 
                                    title="No Reports" 
                                    description="No weekly reports submitted yet for this project." 
                                />
                            ) : (
                                reports.map((report) => (
                                    <Card key={report.report_id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-base flex flex-col gap-0.5">
                                                        <span>Week {report.week_number} Report</span>
                                                        <span className="text-xs font-normal text-muted-foreground">
                                                            {group.project_group_name} • {group.project_title}
                                                        </span>
                                                    </CardTitle>
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        Submitted on {format(new Date(report.submission_date), "PPP")}
                                                    </div>
                                                </div>
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.report_content}</p>
                                            </div>
                                            {report.status !== 'pending' && (
                                                <div className="pt-4 border-t">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-semibold text-sm">Faculty Feedback</span>
                                                        <Badge variant={report.status === 'reviewed' ? 'default' : 'secondary'}>
                                                            {report.status}
                                                        </Badge>
                                                        {report.marks !== null && (
                                                            <Badge variant="outline" className="ml-auto bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                                                                Marks: {report.marks}/100
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm bg-muted/50 p-3 rounded-md">
                                                        {report.feedback || "No written feedback provided."}
                                                    </p>
                                                </div>
                                            )}
                                            {report.status === 'pending' && (
                                                <div className="pt-4 border-t">
                                                    <Badge variant="secondary">Pending Review</Badge>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
