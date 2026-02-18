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

export default async function AllGroupsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth()
    if (!session || !session.user) redirect("/", RedirectType.replace)
    const userRole = (session.user as { role?: string }).role
    if (userRole !== "admin") redirect("/", RedirectType.replace)

    const params = await searchParams
    const statusFilter = typeof params.status === "string" ? params.status : undefined
    const deptFilter = typeof params.department === "string" ? parseInt(params.department) : undefined
    const yearFilter = typeof params.year === "string" ? parseInt(params.year) : undefined
    const typeFilter = typeof params.type === "string" ? parseInt(params.type) : undefined

    const [groups, departments, academicYears, projectTypes] = await Promise.all([
        prisma.project_group.findMany({
            where: {
                ...(statusFilter ? { status: statusFilter } : {}),
                ...(deptFilter ? { department_id: deptFilter } : {}),
                ...(yearFilter ? { academic_year_id: yearFilter } : {}),
                ...(typeFilter ? { project_type_id: typeFilter } : {}),
            },
            include: {
                project_type: true,
                department: true,
                academic_year: true,
                staff_project_group_guide_staff_idTostaff: true,
                project_group_member: { include: { student: true } },
            },
            orderBy: { created_at: "desc" },
        }),
        prisma.department.findMany({ orderBy: { department_name: "asc" } }),
        prisma.academic_year.findMany({ orderBy: { year_name: "desc" } }),
        prisma.project_type.findMany({ orderBy: { project_type_name: "asc" } }),
    ])

    const statuses = ["pending", "approved", "rejected"]

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">All Project Groups</h1>
                <p className="text-muted-foreground">Browse and filter all project groups in the system.</p>
            </div>

            {/* Filter Bar */}
            <Card>
                <CardContent className="pt-6">
                    <form className="flex flex-wrap gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Status</label>
                            <select name="status" defaultValue={statusFilter || ""} className="h-9 w-[150px] rounded-md border border-input bg-background px-3 text-sm">
                                <option value="">All Statuses</option>
                                {statuses.map(s => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Department</label>
                            <select name="department" defaultValue={deptFilter?.toString() || ""} className="h-9 w-[180px] rounded-md border border-input bg-background px-3 text-sm">
                                <option value="">All Departments</option>
                                {departments.map(d => (
                                    <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Academic Year</label>
                            <select name="year" defaultValue={yearFilter?.toString() || ""} className="h-9 w-[160px] rounded-md border border-input bg-background px-3 text-sm">
                                <option value="">All Years</option>
                                {academicYears.map(y => (
                                    <option key={y.academic_year_id} value={y.academic_year_id}>{y.year_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Project Type</label>
                            <select name="type" defaultValue={typeFilter?.toString() || ""} className="h-9 w-[160px] rounded-md border border-input bg-background px-3 text-sm">
                                <option value="">All Types</option>
                                {projectTypes.map(t => (
                                    <option key={t.project_type_id} value={t.project_type_id}>{t.project_type_name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="h-9 rounded-md bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90 transition-colors">
                            Apply Filters
                        </button>
                        <a href="/dashboard/admin/all-groups" className="h-9 rounded-md border border-input px-4 text-sm font-medium flex items-center hover:bg-accent transition-colors">
                            Clear
                        </a>
                    </form>
                </CardContent>
            </Card>

            {/* Results */}
            <Card>
                <CardHeader>
                    <CardTitle>{groups.length} Group{groups.length !== 1 ? "s" : ""} Found</CardTitle>
                    <CardDescription>
                        {statusFilter || deptFilter || yearFilter || typeFilter
                            ? "Showing filtered results."
                            : "Showing all project groups."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {groups.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No groups match the selected filters.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Group</TableHead>
                                        <TableHead>Project Title</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Guide</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead>Members</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {groups.map(group => (
                                        <TableRow key={group.project_group_id}>
                                            <TableCell className="font-medium">{group.project_group_name}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">{group.project_title}</TableCell>
                                            <TableCell>{group.project_type.project_type_name}</TableCell>
                                            <TableCell>{group.staff_project_group_guide_staff_idTostaff?.staff_name || "—"}</TableCell>
                                            <TableCell>{group.department?.department_name || "—"}</TableCell>
                                            <TableCell>{group.academic_year?.year_name || "—"}</TableCell>
                                            <TableCell>
                                                <span title={group.project_group_member.map(m => m.student.student_name).join(", ")}>
                                                    {group.project_group_member.length}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    group.status === "approved" ? "default"
                                                        : group.status === "rejected" ? "destructive"
                                                            : "secondary"
                                                }>
                                                    {group.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">
                                                {format(new Date(group.created_at), "PP")}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
