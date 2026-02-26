
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateStaffForm } from "@/components/admin/create-staff-form"
import { PasswordResetGenerator } from "@/components/admin/password-reset-generator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function UserManagementPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">Create and manage faculty and staff accounts.</p>
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Student Registration</AlertTitle>
                <AlertDescription>
                    Students can now create their own accounts through the sign-up page.
                    This page is only for managing faculty and staff accounts.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>Create Faculty/Staff Account</CardTitle>
                    <CardDescription>
                        Add a new faculty or staff member to the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateStaffForm />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Password Reset</CardTitle>
                    <CardDescription>
                        Generate a one-time password reset link for a student or faculty member.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PasswordResetGenerator />
                </CardContent>
            </Card>
        </div>
    )
}
