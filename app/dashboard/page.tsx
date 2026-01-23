
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/')
    }

    const role = (session.user as any).role

    if (role === 'student') {
        redirect('/dashboard/student')
    } else if (role === 'faculty') {
        redirect('/dashboard/faculty')
    } else {
        // Fallback or error page
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold">Unknown Role</h1>
                <p>Please contact support.</p>
            </div>
        )
    }
}
