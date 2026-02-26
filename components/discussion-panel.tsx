"use client"

import { useEffect, useState, useRef, useTransition } from "react"
import { getDiscussionMessages, sendDiscussionMessage } from "@/lib/discussion-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageSquare, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useSocket } from "@/components/socket-provider"

type Message = {
    message_id: number
    sender_id: number
    sender_role: string
    content: string
    created_at: Date
}

interface DiscussionPanelProps {
    projectGroupId: number
    groupName: string
    currentUserId: number
    currentUserRole: string
}

export function DiscussionPanel({
    projectGroupId,
    groupName,
    currentUserId,
    currentUserRole,
}: DiscussionPanelProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isPending, startTransition] = useTransition()
    const scrollRef = useRef<HTMLDivElement>(null)
    const socket = useSocket()
    const prevGroupRef = useRef<number | null>(null)

    // Initial load from DB
    const fetchMessages = async () => {
        const msgs = await getDiscussionMessages(projectGroupId)
        setMessages(msgs as Message[])
    }

    // Join/leave group rooms via WebSocket
    useEffect(() => {
        if (!socket) return

        // Leave previous group room if switching
        if (prevGroupRef.current && prevGroupRef.current !== projectGroupId) {
            socket.emit("leave:group", { groupId: prevGroupRef.current })
        }

        // Join new group room
        socket.emit("join:group", { groupId: projectGroupId })
        prevGroupRef.current = projectGroupId

        // Listen for incoming messages
        const handler = (msg: Message) => {
            setMessages((prev) => [...prev, msg])
        }

        socket.on("discussion:message", handler)

        return () => {
            socket.off("discussion:message", handler)
        }
    }, [socket, projectGroupId])

    // Initial fetch
    useEffect(() => {
        fetchMessages()
    }, [projectGroupId])

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const formData = new FormData()
        formData.set("content", newMessage)
        formData.set("projectGroupId", String(projectGroupId))

        startTransition(async () => {
            try {
                await sendDiscussionMessage(formData)
                setNewMessage("")
                // No need to re-fetch — the WebSocket event will add the message
            } catch (err) {
                console.error("Failed to send message:", err)
            }
        })
    }

    const isOwn = (msg: Message) =>
        msg.sender_id === currentUserId && msg.sender_role === currentUserRole

    return (
        <div className="flex flex-col h-[500px] border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 border-b px-4 py-3 bg-muted/30">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">{groupName}</h3>
                <span className="text-xs text-muted-foreground ml-auto">
                    {messages.length} message{messages.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.message_id}
                            className={`flex ${isOwn(msg) ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${isOwn(msg)
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    }`}
                            >
                                {!isOwn(msg) && (
                                    <p className="text-[11px] font-medium mb-0.5 opacity-70">
                                        {msg.sender_role === "faculty" ? "Guide" : `Student #${msg.sender_id}`}
                                    </p>
                                )}
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${isOwn(msg) ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex items-center gap-2 border-t px-4 py-3">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={isPending}
                />
                <Button type="submit" size="icon" disabled={isPending || !newMessage.trim()}>
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </form>
        </div>
    )
}
