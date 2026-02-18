
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminProfilePage() {
    const session = await auth()
    if (!session || (session.user as any).role !== 'admin') {
        redirect('/', RedirectType.replace)
    }

    const staffId = parseInt((session.user as any).id)
    const staff = await prisma.staff.findUnique({
        where: { staff_id: staffId },
    })

    if (!staff) {
        return <div>Staff not found</div>
    }

    // Initials
    const initials = staff.staff_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    // Admin stats
    const [totalStudents, totalFaculty, totalGroups] = await Promise.all([
        prisma.student.count(),
        prisma.staff.count({ where: { role: "faculty" } }),
        prisma.project_group.count(),
    ])

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                    <p className="text-muted-foreground">Your admin account information.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/admin/settings">Edit Profile</Link>
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
                                <AvatarImage src="/avatars/01.png" alt={staff.staff_name} />
                                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-medium">{staff.staff_name}</h3>
                                <p className="text-sm text-muted-foreground">Admin</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-1">
                                <Label className="text-muted-foreground">Email</Label>
                                <div className="font-medium">{staff.email}</div>
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-muted-foreground">Phone</Label>
                                <div className="font-medium">{staff.phone || "Not provided"}</div>
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-muted-foreground">Description</Label>
                                <div className="font-medium">{staff.description || "No description"}</div>
                            </div>
                            {staff.skills && staff.skills.length > 0 && (
                                <div className="grid gap-1">
                                    <Label className="text-muted-foreground">Skills</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {staff.skills.map((skill, i) => (
                                            <Badge key={i} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

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
