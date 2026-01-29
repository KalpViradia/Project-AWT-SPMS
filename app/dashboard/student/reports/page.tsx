import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Calendar } from "lucide-react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitReport } from "@/lib/actions"
import { Badge } from "@/components/ui/badge"

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

    const group = studentWithGroup?.project_group_member[0]?.project_group

    if (!group) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">Manage your weekly project reports.</p>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8 text-muted-foreground">
                            You need to be in a project group to view reports.
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const reports = await prisma.weekly_report.findMany({
        where: { project_group_id: group.project_group_id },
        orderBy: { week_number: 'desc' }
    })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">Manage your weekly project reports for {group.project_group_name}.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Submit New Report</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Submit Weekly Report</DialogTitle>
                            <DialogDescription>
                                Submit your progress report for the current week.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={submitReport} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="weekNumber">Week Number</Label>
                                <Input
                                    id="weekNumber"
                                    name="weekNumber"
                                    type="number"
                                    min="1"
                                    max="52"
                                    required
                                    placeholder="e.g., 1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Report Content</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    required
                                    placeholder="Describe your progress, challenges, and plans for next week..."
                                    className="min-h-[150px]"
                                />
                            </div>
                            <Button type="submit" className="w-full">Submit Report</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {reports.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8 text-muted-foreground">
                                No weekly reports submitted yet.
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    reports.map((report) => (
                        <Card key={report.report_id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">Week {report.week_number} Report</CardTitle>
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
                                                <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
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
}
