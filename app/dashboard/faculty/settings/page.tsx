import { auth } from "@/auth"
import { RedirectType, redirect } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { updateFacultyProfile } from "@/lib/actions"
import { ProfileViewEdit } from "@/components/profile-view-edit"

export default async function FacultySettingsPage() {
    const session = await auth()
    if (!session || (session.user as any).role !== 'faculty') {
        redirect('/', RedirectType.replace)
    }

    const staffId = parseInt((session.user as any).id);
    const staff = await prisma.staff.findUnique({
        where: { staff_id: staffId }
    });

    if (!staff) {
        return <div>Staff not found</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings.</p>
            </div>

            <ProfileViewEdit
                initialData={{
                    name: staff.staff_name,
                    email: staff.email || '',
                    phone: staff.phone,
                    description: staff.description
                }}
                action={updateFacultyProfile}
                role="faculty"
            />

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize the look and feel of the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Theme settings are available in the top navigation bar.</p>
                </CardContent>
            </Card>
        </div>
    )
}
