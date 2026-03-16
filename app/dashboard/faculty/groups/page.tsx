
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchSelect } from "@/components/ui/search-select"
import { AcademicFilterSelector } from "@/components/shared/academic-filter-selector"
import { Check, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PendingGroupsList } from "@/components/faculty/pending-groups-list"
import { FacultyGroupsExportClient } from "@/components/faculty/groups-export-client"
import { EmptyState } from "@/components/ui/empty-state"

export default async function FacultyGroupsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth()
    if (!session || !session.user) {
        redirect('/', RedirectType.replace)
    }

    const user = session.user as { id: string; role?: string | null }

    if (user.role !== 'faculty') {
        redirect('/', RedirectType.replace)
    }

    const staffId = parseInt(user.id)

    // Get metadata for filters
    const [projectTypes] = await Promise.all([
        prisma.project_type.findMany({ orderBy: { project_type_name: "asc" } }),
    ])

    const params = await searchParams
    const typeParam = typeof params.type === "string" ? params.type : undefined
    const parsedType = typeParam ? parseInt(typeParam) : undefined
    const typeFilter = parsedType && !isNaN(parsedType) ? parsedType : undefined

    const allGroups = await prisma.project_group.findMany({
        where: { 
            guide_staff_id: staffId,
            ...(typeFilter ? { project_type_id: typeFilter } : {}),
        },
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

    // Prepare export data
    const exportData = allGroups.map((group) => ({
        groupName: group.project_group_name,
        projectTitle: group.project_title,
        projectType: group.project_type.project_type_name,
        status: group.status,
        memberCount: group.project_group_member.length,
        members: group.project_group_member.map((m) => m.student.student_name).join(", "),
        pendingReports: group.weekly_report.length,
    }))

    const exportColumns = [
        { header: "Group Name", key: "groupName" },
        { header: "Project Title", key: "projectTitle" },
        { header: "Type", key: "projectType" },
        { header: "Status", key: "status" },
        { header: "Member Count", key: "memberCount" },
        { header: "Members", key: "members" },
        { header: "Pending Reports", key: "pendingReports" },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Groups</h1>
                    <p className="text-muted-foreground">Manage project groups under your supervision.</p>
                </div>
                <div className="flex items-center gap-3">
                    {allGroups.length > 0 && (
                        <FacultyGroupsExportClient data={exportData} columns={exportColumns} />
                    )}
                </div>
            </div>

            {/* Filter Bar */}
            <Card>
                <CardContent className="pt-6">
                    <form className="flex flex-wrap gap-6 items-end">

                        <div className="space-y-2 flex flex-col min-w-[200px]">
                            <label className="text-sm font-medium">Project Type</label>
                            <AcademicFilterSelector 
                                name="type" 
                                items={projectTypes.map(t => ({ label: t.project_type_name, value: t.project_type_id.toString() }))}
                                defaultValue={typeFilter?.toString()}
                                placeholder="Select Type..."
                            />
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                            <Button type="submit" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Apply Filters
                            </Button>
                            <Button asChild variant="outline" className="gap-2">
                                <a href="/dashboard/faculty/groups">
                                    <X className="h-4 w-4" />
                                    Clear
                                </a>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

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
                        <EmptyState 
                            icon="folder" 
                            title="No Assigned Groups" 
                            description="You have no active project groups assigned to you." 
                            className="border-none bg-background shadow-none min-h-[300px]"
                        />
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
                                            <div className="flex flex-col gap-1.5">
                                                <Badge variant="outline" className="w-fit">{group.project_type.project_type_name}</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {group.weekly_report.length}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2">
                                                {group.project_group_member.map((member) => (
                                                    <div key={member.project_group_member_id} className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={member.student.avatar_url || ""} alt={member.student.student_name} />
                                                            <AvatarFallback className="text-[10px]">
                                                                {member.student.student_name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs">
                                                            {member.student.student_name} {member.is_group_leader && "(Leader)"}
                                                        </span>
                                                    </div>
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


