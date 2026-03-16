
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProfileViewEdit } from "@/components/profile-view-edit"
import { updateFacultyProfile } from "@/lib/actions"

export default async function AdminProfilePage() {
    const session = await auth()
    if (!session || (session.user as any).role !== 'admin') {
        redirect('/', RedirectType.replace)
    }

    const staffId = parseInt((session.user as any).id)
    const staff = await prisma.staff.findUnique({
        where: { staff_id: staffId },
        include: {
            department: true
        }
    })

    const departments = await prisma.department.findMany({
        orderBy: { department_name: 'asc' }
    })

    if (!staff) {
        return <div>Staff not found</div>
    }

    // Admin stats
    const [totalStudents, totalFaculty, totalGroups] = await Promise.all([
        prisma.student.count(),
        prisma.staff.count({ where: { role: "faculty" } }),
        prisma.project_group.count(),
    ])

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">Your admin account information.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="md:col-span-2">
                    <ProfileViewEdit
                        initialData={{
                            name: staff.staff_name,
                            email: staff.email || '',
                            phone: staff.phone,
                            description: staff.description,
                            avatar_url: staff.avatar_url,
                            skills: staff.skills || [],
                            department_id: staff.department_id,
                            department_name: staff.department?.department_name
                        }}
                        action={updateFacultyProfile}
                        role="admin"
                        departments={departments}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>System Overview</CardTitle>
                        <CardDescription>Current system statistics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Total Students</div>
                            <div className="text-2xl font-bold">{totalStudents}</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Total Faculty</div>
                            <div className="text-2xl font-bold">{totalFaculty}</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Total Project Groups</div>
                            <div className="text-2xl font-bold">{totalGroups}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
