import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KanbanBoard } from "@/components/shared/kanban-board"
import { getTasks } from "@/lib/task-actions"
import { ListTodo } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export default async function TasksPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const user = session.user as { id: string; role?: string | null }
    if (user.role !== "student") redirect("/")

    const studentId = parseInt(user.id)

    const memberships = await prisma.project_group_member.findMany({
        where: { student_id: studentId },
        include: {
            project_group: {
                include: {
                    project_group_member: {
                        include: { student: { select: { student_id: true, student_name: true } } },
                    },
                },
            },
        },
    })

    if (memberships.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
                <EmptyState 
                    icon={<ListTodo className="h-12 w-12 text-muted-foreground/30" />}
                    title="No Project Group" 
                    description="Join a project group to use the task board." 
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Task Boards</h1>
                <p className="text-muted-foreground">
                    Manage your project tasks across columns. Click arrows to move tasks.
                </p>
            </div>

            {memberships.map(async (membership) => {
                const group = membership.project_group
                const groupId = group.project_group_id

                const tasks = await getTasks(groupId)
                const members = group.project_group_member.map((m) => ({
                    student_id: m.student.student_id,
                    student_name: m.student.student_name,
                }))

                return (
                    <Card key={groupId}>
                        <CardHeader>
                            <CardTitle>{group.project_group_name}</CardTitle>
                            <CardDescription>
                                {group.project_title} · {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <KanbanBoard
                                tasks={tasks}
                                projectGroupId={groupId}
                                members={members}
                                editable={true}
                            />
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
