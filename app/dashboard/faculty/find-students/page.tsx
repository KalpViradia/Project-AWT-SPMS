import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { StudentSearchBySkills } from "@/components/faculty/student-search-by-skills"

export default async function FindStudentsPage() {
    const session = await auth()
    if (!session || (session.user as any).role !== 'faculty') {
        redirect('/')
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Find Students</h1>
                <p className="text-muted-foreground">Search for students based on their skills and expertise.</p>
            </div>
            <StudentSearchBySkills />
        </div>
    )
}
