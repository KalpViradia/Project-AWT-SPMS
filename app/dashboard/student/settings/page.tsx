import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { updateStudentProfile } from "@/lib/actions"
import { ProfileViewEdit } from "@/components/profile-view-edit"

export default async function SettingsPage() {
    const session = await auth()
    if (!session || (session.user as any).role !== 'student') {
        redirect('/')
    }

    const studentId = parseInt((session.user as any).id);
    const student = await prisma.student.findUnique({
        where: { student_id: studentId }
    });

    if (!student) {
        return <div>Student not found</div>
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <ProfileViewEdit
                initialData={{
                    name: student.student_name,
                    email: student.email || '',
                    phone: student.phone,
                    description: student.description,
                    skills: student.skills || []
                }}
                action={updateStudentProfile}
                role="student"
            />

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize the appearance of the application.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Theme settings are available in the top navigation bar.</p>
                </CardContent>
            </Card>
        </div>
    )
}
