
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ProfilePage() {
    const session = await auth()
    if (!session || (session.user as any).role !== 'student') {
        redirect('/', RedirectType.replace)
    }

    const studentId = parseInt((session.user as any).id)
    const student = await prisma.student.findUnique({
        where: { student_id: studentId },
        include: {
            project_group_member: {
                include: {
                    project_group: true
                }
            }
        }
    })

    if (!student) {
        return <div>Student not found</div>
    }

    const group = student.project_group_member[0]?.project_group

    // Initials
    const initials = student.student_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                    <p className="text-muted-foreground">Manage your personal information.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/student/settings">Edit Profile</Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Info</CardTitle>
                        <CardDescription>Your basic profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src="/avatars/01.png" alt={student.student_name} />
                                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-medium">{student.student_name}</h3>
                                <p className="text-sm text-muted-foreground">Student</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-1">
                                <Label className="text-muted-foreground">Email</Label>
                                <div className="font-medium">{student.email}</div>
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-muted-foreground">Phone</Label>
                                <div className="font-medium">{student.phone || "Not provided"}</div>
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-muted-foreground">Description</Label>
                                <div className="font-medium">{student.description || "No description"}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Academic Status</CardTitle>
                        <CardDescription>Your current project group status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                                <div className="font-medium">Project Group</div>
                                <div className="text-sm text-muted-foreground">
                                    {group ? group.project_group_name : "Not assigned"}
                                </div>
                            </div>
                            <Badge variant={group ? "default" : "secondary"}>
                                {group ? "Active" : "Pending"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
