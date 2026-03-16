"use client"

import { useState } from "react"
import { ChatPanel } from "@/components/shared/chat-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Search } from "lucide-react"
import { SearchSelect } from "@/components/ui/search-select"
import { cn } from "@/lib/utils"

interface Props {
    groups: { groupId: number; groupName: string }[]
    studentId: number
    studentName: string
}

export function StudentDiscussionClient({ groups, studentId, studentName }: Props) {
    const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.groupId.toString() || "")
    const [tab, setTab] = useState<"discussion" | "announcement">("discussion")
    const [showGroupSearch, setShowGroupSearch] = useState(false)

    const selectedGroup = groups.find((g) => g.groupId === parseInt(selectedGroupId))

    if (!selectedGroup) return null

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Discussion</h1>
                        <p className="text-muted-foreground">
                            Chat with your group members and view guide announcements.
                        </p>
                    </div>
                    {groups.length > 1 && !showGroupSearch && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => setShowGroupSearch(true)}
                        >
                            <Search className="h-4 w-4" />
                            Switch Group
                        </Button>
                    )}
                </div>
                {groups.length > 1 && showGroupSearch && (
                    <div className="w-full sm:w-[350px] animate-in fade-in slide-in-from-right-2 duration-200">
                        <SearchSelect
                            items={groups.map(g => ({
                                label: g.groupName,
                                value: g.groupId.toString()
                            }))}
                            value={selectedGroupId}
                            onValueChange={(val) => {
                                setSelectedGroupId(val)
                                setShowGroupSearch(false)
                            }}
                            placeholder="Search and switch group..."
                            onBlur={() => setShowGroupSearch(false)}
                            autoFocus={true}
                        />
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
                <button
                    onClick={() => setTab("discussion")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "discussion"
                            ? "bg-background shadow text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    💬 Discussion
                </button>
                <button
                    onClick={() => setTab("announcement")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "announcement"
                            ? "bg-background shadow text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    📢 Announcements
                </button>
            </div>

            <ChatPanel
                key={`${selectedGroup.groupId}-${tab}`}
                projectGroupId={selectedGroup.groupId}
                groupName={selectedGroup.groupName}
                currentUserId={studentId}
                currentUserName={studentName}
                currentUserRole="student"
                channel={tab}
                canSend={tab === "discussion"}
                canReply={tab === "announcement"}
            />
        </div>
    )
}
