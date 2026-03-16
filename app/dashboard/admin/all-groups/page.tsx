import React from "react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { SearchSelect } from "@/components/ui/search-select"
import { AcademicFilterSelector } from "@/components/shared/academic-filter-selector"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Check, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function AllGroupsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth()
    if (!session || !session.user) redirect("/", RedirectType.replace)
    const userRole = (session.user as { role?: string }).role
    if (userRole !== "admin") redirect("/", RedirectType.replace)

    // Get metadata for filters
    const [departments, projectTypes] = await Promise.all([
        prisma.department.findMany({ orderBy: { department_name: "asc" } }),
        prisma.project_type.findMany({ orderBy: { project_type_name: "asc" } }),
    ])

    const params = await searchParams
    const statusFilter = typeof params.status === "string" ? params.status : undefined
    
    const deptParam = typeof params.department === "string" ? params.department : undefined
    const parsedDept = deptParam ? parseInt(deptParam) : undefined
    const deptFilter = parsedDept && !isNaN(parsedDept) ? parsedDept : undefined

    const typeParam = typeof params.type === "string" ? params.type : undefined
    const parsedType = typeParam ? parseInt(typeParam) : undefined
    const typeFilter = parsedType && !isNaN(parsedType) ? parsedType : undefined

    const groups = await prisma.project_group.findMany({
        where: {
            ...(statusFilter ? { status: statusFilter } : {}),
            ...(deptFilter ? { department_id: deptFilter } : {}),
            ...(typeFilter ? { project_type_id: typeFilter } : {}),
        },
        include: {
            project_type: true,
            department: true,
            staff_project_group_guide_staff_idTostaff: true,
            project_group_member: { include: { student: true } },
        },
        orderBy: { created_at: "desc" },
    })

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
                    <form className="flex flex-wrap gap-6 items-end">
                        <div className="space-y-2 flex flex-col min-w-[150px]">
                            <label className="text-sm font-medium">Status</label>
                            <select 
                                name="status" 
                                defaultValue={statusFilter || ""} 
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            >
                                <option value="">All Statuses</option>
                                {statuses.map(s => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 flex flex-col min-w-[200px]">
                            <label className="text-sm font-medium">Department</label>
                            <AcademicFilterSelector 
                                name="department" 
                                items={departments.map(d => ({ label: d.department_name, value: d.department_id.toString() }))}
                                defaultValue={deptFilter?.toString()}
                                placeholder="Select Department..."
                            />
                        </div>


                        <div className="space-y-2 flex flex-col min-w-[180px]">
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
                                <a href="/dashboard/admin/all-groups">
                                    <X className="h-4 w-4" />
                                    Clear
                                </a>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Results */}
            <Card>
                <CardHeader>
                    <CardTitle>{groups.length} Group{groups.length !== 1 ? "s" : ""} Found</CardTitle>
                    <CardDescription>
                        {statusFilter || deptFilter || typeFilter
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
                                            <TableCell>
                                                <div className="flex -space-x-2">
                                                    {group.project_group_member.slice(0, 3).map((member) => (
                                                        <Avatar key={member.student_id} className="h-7 w-7 border-2 border-background ring-2 ring-primary/5">
                                                            <AvatarImage src={member.student.avatar_url || ""} />
                                                            <AvatarFallback className="text-[10px]">
                                                                {member.student.student_name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                    {group.project_group_member.length > 3 && (
                                                        <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium z-10">
                                                            +{group.project_group_member.length - 3}
                                                        </div>
                                                    )}
                                                </div>
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


