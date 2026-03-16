"use client"

import { useState, useEffect } from "react"
import { getFacultyGroups } from "@/lib/discussion-actions"
import { ChatPanel } from "@/components/shared/chat-panel"
import { SearchSelect } from "@/components/ui/search-select"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { useSession } from "next-auth/react"

type Group = {
    project_group_id: number
    project_group_name: string
    project_title: string
}

export default function FacultyDiscussionPage() {
    const { data: session } = useSession()
    const [groups, setGroups] = useState<Group[]>([])
    const [selectedGroupId, setSelectedGroupId] = useState<string>("")
    const [open, setOpen] = useState(false)

    useEffect(() => {
        getFacultyGroups().then((g) => setGroups(g))
    }, [])

    const selectedGroup = groups.find((g) => g.project_group_id === parseInt(selectedGroupId))
    const userId = parseInt((session?.user as any)?.id || "0")
    const userName = session?.user?.name || "Faculty"

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                <p className="text-muted-foreground">
                    Post announcements to your guided project groups.
                </p>
            </div>

            <div className="max-w-xs">
                <SearchSelect
                    items={groups.map(g => ({
                        label: g.project_group_name,
                        value: g.project_group_id.toString()
                    }))}
                    value={selectedGroupId}
                    onValueChange={setSelectedGroupId}
                    placeholder="Search and select group..."
                />
            </div>

            {selectedGroup ? (
                <ChatPanel
                    key={selectedGroup.project_group_id}
                    projectGroupId={selectedGroup.project_group_id}
                    groupName={selectedGroup.project_group_name}
                    currentUserId={userId}
                    currentUserName={userName}
                    currentUserRole="faculty"
                    channel="announcement"
                    canSend={true}
                    canReply={true}
                />
            ) : (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-40" />
                        <p>{groups.length === 0 ? "You are not a guide for any groups." : "Select a group to manage announcements."}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
