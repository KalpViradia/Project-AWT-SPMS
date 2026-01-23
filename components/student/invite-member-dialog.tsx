"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { inviteMember } from "@/lib/actions"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"

interface InviteMemberDialogProps {
    groupId: number
}

export function InviteMemberDialog({ groupId }: InviteMemberDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    async function handleAction(formData: FormData) {
        setIsPending(true)
        try {
            await inviteMember(formData)
            setOpen(false)
            toast.success("Invitation sent successfully")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send invitation")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Member
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Member</DialogTitle>
                    <DialogDescription>
                        Send an invitation to a student to join your group.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Student Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="student@example.com"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Sending..." : "Send Invitation"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
