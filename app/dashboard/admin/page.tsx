import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RedirectType, redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, GraduationCap, UserCheck } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { assignGuideAsAdmin } from "@/lib/admin-actions";

export default async function AdminDashboardPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/", RedirectType.replace);
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "admin") {
        redirect("/", RedirectType.replace);
    }

    const [totalStudents, totalFaculty, totalProjects, groupsWithoutMeetings, unassignedGroups, facultyList] =
        await Promise.all([
            prisma.student.count(),
            prisma.staff.count({
                where: { role: "faculty" },
            }),
            prisma.project_group.count(),
            // Groups with no meetings scheduled yet (oversight metric)
            prisma.project_group.count({
                where: {
                    project_meeting: {
                        none: {},
                    },
                },
            }),
            prisma.project_group.findMany({
                where: { guide_staff_id: null },
                include: {
                    project_type: true,
                },
                orderBy: {
                    created_at: "desc",
                },
                take: 5,
            }),
            prisma.staff.findMany({
                where: { role: "faculty" },
                orderBy: {
                    staff_name: "asc",
                },
            }),
        ]);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Registered in the system</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalFaculty}</div>
                        <p className="text-xs text-muted-foreground">Registered staff members</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProjects}</div>
                        <p className="text-xs text-muted-foreground">Active project groups</p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            {groupsWithoutMeetings} group(s) have no meetings scheduled yet
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                            Assign Project Guides
                        </CardTitle>
                        <CardDescription>
                            Assign faculty mentors to project groups that do not yet have a guide.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {unassignedGroups.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            All project groups currently have an assigned guide.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Group</TableHead>
                                    <TableHead>Project Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Assign Mentor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {unassignedGroups.map((group) => (
                                    <TableRow key={group.project_group_id}>
                                        <TableCell className="font-medium">
                                            {group.project_group_name}
                                        </TableCell>
                                        <TableCell>{group.project_title}</TableCell>
                                        <TableCell>
                                            {group.project_type?.project_type_name ?? "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <form
                                                action={assignGuideAsAdmin}
                                                className="flex items-center justify-end gap-2"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="groupId"
                                                    value={group.project_group_id}
                                                />
                                                <select
                                                    name="guideId"
                                                    className="border border-input bg-background text-sm rounded-md px-2 py-1"
                                                    defaultValue=""
                                                    required
                                                >
                                                    <option value="" disabled>
                                                        Select faculty
                                                    </option>
                                                    {facultyList.map((faculty) => (
                                                        <option
                                                            key={faculty.staff_id}
                                                            value={faculty.staff_id}
                                                        >
                                                            {faculty.staff_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Button type="submit" variant="outline" size="sm">
                                                    Assign
                                                </Button>
                                            </form>
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
