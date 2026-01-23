
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
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PendingGroupsList } from "@/components/faculty/pending-groups-list"

export default async function FacultyGroupsPage() {
    const session = await auth()
    if (!session || !session.user) {
        redirect('/', RedirectType.replace)
    }

    const user = session.user as { id: string; role?: string | null }

    if (user.role !== 'faculty') {
        redirect('/', RedirectType.replace)
    }

    const staffId = parseInt(user.id)

    const allGroups = await prisma.project_group.findMany({
        where: { guide_staff_id: staffId },
        include: {
            project_type: true,
            project_group_member: {
                include: {
                    student: true
                }
            },
            weekly_report: {
                where: { status: 'pending' }
            }
        }
    })

    const pendingGroups = allGroups.filter(g => g.status === 'pending')
    const activeGroups = allGroups.filter(g => g.status === 'approved')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Groups</h1>
                <p className="text-muted-foreground">Manage project groups under your supervision.</p>
            </div>

            <PendingGroupsList groups={pendingGroups} />

            <Card>
                <CardHeader>
                    <CardTitle>Assigned Groups</CardTitle>
                    <CardDescription>
                        List of all active project groups you are guiding.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeGroups.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">No active groups assigned.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Group Name</TableHead>
                                    <TableHead>Project Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Pending Reviews</TableHead>
                                    <TableHead>Members</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activeGroups.map((group) => (
                                    <TableRow key={group.project_group_id}>
                                        <TableCell className="font-medium">{group.project_group_name}</TableCell>
                                        <TableCell>{group.project_title}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{group.project_type.project_type_name}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {group.weekly_report.length}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {group.project_group_member.map((member) => (
                                                    <span key={member.project_group_member_id} className="text-xs">
                                                        {member.student.student_name} {member.is_group_leader && "(Leader)"}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/dashboard/faculty/groups/${group.project_group_id}`}>View</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
