import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { updateReportFeedback } from "@/lib/actions"

export default async function ReportReviewsPage() {
    const session = await auth()
    if (!session || !session.user) {
        redirect('/', RedirectType.replace)
    }

    const user = session.user as { id: string; role?: string | null }

    if (user.role !== 'faculty') {
        redirect('/', RedirectType.replace)
    }

    const staffId = parseInt(user.id)

    const reports = await prisma.weekly_report.findMany({
        where: {
            project_group: {
                guide_staff_id: staffId
            }
        },
        include: {
            project_group: true
        },
        // Show pending reports first, then reviewed, with newest submissions at the top
        orderBy: [
            { status: 'asc' },
            { submission_date: 'desc' }
        ]
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Report Reviews</h1>
                <p className="text-muted-foreground">Review and provide feedback on weekly progress reports.</p>
            </div>

            <div className="space-y-4">
                {reports.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8 text-muted-foreground">
                                No reports found.
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    reports.map((report) => (
                        <Card key={report.report_id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {report.project_group.project_group_name}: Week {report.week_number}
                                        </CardTitle>
                                        <CardDescription>
                                            Submitted on {new Date(report.submission_date).toLocaleDateString()}
                                            {report.marks !== null && (
                                                <span className="ml-2 text-green-600 font-medium">
                                                    • Marks: {report.marks}/100
                                                </span>
                                            )}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={report.status === 'pending' ? 'secondary' : 'default'}>
                                        {report.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-muted-foreground">Student Report</Label>
                                    <div className="mt-1 p-3 bg-muted/50 rounded-md text-sm whitespace-pre-wrap">
                                        {report.report_content}
                                    </div>
                                </div>

                                <form action={updateReportFeedback} className="space-y-3 border-t pt-4">
                                    <input type="hidden" name="reportId" value={report.report_id} />
                                    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                                        <div className="space-y-1">
                                            <Label htmlFor={`feedback-${report.report_id}`}>Feedback</Label>
                                            <Textarea
                                                id={`feedback-${report.report_id}`}
                                                name="feedback"
                                                placeholder="Enter your feedback here..."
                                                defaultValue={report.feedback || ""}
                                            />
                                        </div>
                                        <div className="space-y-1 sm:w-24">
                                            <Label htmlFor={`marks-${report.report_id}`}>Marks (0-100)</Label>
                                            <Input
                                                id={`marks-${report.report_id}`}
                                                name="marks"
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="—"
                                                defaultValue={report.marks ?? ""}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button type="submit" size="sm">Update Feedback & Marks</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
