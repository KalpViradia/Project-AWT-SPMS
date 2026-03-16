import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getStudentGroups } from "@/lib/discussion-actions"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { StudentDiscussionClient } from "./client"

export default async function StudentDiscussionPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const user = session.user as { id: string; name?: string | null; role?: string | null }
    const studentId = parseInt(user.id)

    const groups = await getStudentGroups()

    if (!groups || groups.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Discussion</h1>
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-40" />
                        <p>Join a project group to access the discussion.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <StudentDiscussionClient
            groups={groups}
            studentId={studentId}
            studentName={user.name || "Student"}
        />
    )
}
