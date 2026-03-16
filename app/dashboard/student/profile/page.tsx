
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProfileViewEdit } from "@/components/profile-view-edit"
import { updateStudentProfile } from "@/lib/actions"

export default async function ProfilePage() {
    const session = await auth()
    if (!session || (session.user as any).role !== 'student') {
        redirect('/', RedirectType.replace)
    }

    const studentId = parseInt((session.user as any).id)
    const student = await prisma.student.findUnique({
        where: { student_id: studentId },
        include: {
            department: true,
            project_group_member: {
                include: {
                    project_group: true
                }
            }
        }
    })

    const departments = await prisma.department.findMany({
        orderBy: { department_name: 'asc' }
    })

    if (!student) {
        return <div>Student not found</div>
    }

    const group = student.project_group_member[0]?.project_group

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">Manage your personal information.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="md:col-span-2">
                    <ProfileViewEdit
                        initialData={{
                            name: student.student_name,
                            email: student.email || '',
                            phone: student.phone,
                            description: student.description,
                            avatar_url: student.avatar_url,
                            skills: student.skills || [],
                            department_id: student.department_id,
                            department_name: student.department?.department_name
                        }}
                        action={updateStudentProfile}
                        role="student"
                        departments={departments}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Academic Status</CardTitle>
                        <CardDescription>Your current project group statuses</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {student.project_group_member.length > 0 ? (
                            student.project_group_member.map((membership) => {
                                const group = membership.project_group;
                                return (
                                    <div key={group.project_group_id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-1">
                                            <div className="font-medium">Project Group</div>
                                            <div className="text-sm text-muted-foreground">
                                                {group.project_group_name}
                                            </div>
                                        </div>
                                        <Badge variant={group.status === "approved" ? "default" : group.status === "rejected" ? "destructive" : "secondary"}>
                                            {group.status}
                                        </Badge>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <div className="font-medium">Project Group</div>
                                    <div className="text-sm text-muted-foreground">
                                        Not assigned
                                    </div>
                                </div>
                                <Badge variant="secondary">
                                    Pending
                                </Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
