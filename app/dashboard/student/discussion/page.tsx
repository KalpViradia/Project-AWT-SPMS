import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getStudentGroupId } from "@/lib/discussion-actions"
import { DiscussionPanel } from "@/components/discussion-panel"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export default async function StudentDiscussionPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const user = session.user as { id: string; role?: string | null }
    const studentId = parseInt(user.id)

    const groupInfo = await getStudentGroupId()

    if (!groupInfo) {
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
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Discussion</h1>
                <p className="text-muted-foreground">
                    Chat with your group members and guide.
                </p>
            </div>
            <DiscussionPanel
                projectGroupId={groupInfo.groupId}
                groupName={groupInfo.groupName}
                currentUserId={studentId}
                currentUserRole="student"
            />
        </div>
    )
}
