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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { scheduleMeeting } from "@/lib/actions"
import { toast } from "sonner"

interface ScheduleMeetingDialogProps {
    groups: {
        project_group_id: number;
        project_group_name: string;
    }[];
    existingLocations?: string[];
}

export function ScheduleMeetingDialog({ groups, existingLocations = [] }: ScheduleMeetingDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    async function handleAction(formData: FormData) {
        setIsPending(true)
        try {
            await scheduleMeeting(formData)
            setOpen(false)
            toast.success("Meeting scheduled successfully")
        } catch (error) {
            toast.error("Failed to schedule meeting")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Schedule New Meeting</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Schedule Meeting</DialogTitle>
                    <DialogDescription>
                        Set up a meeting with a project group.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="group">Project Group</Label>
                        <Select name="projectGroupId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent>
                                {groups.map(group => (
                                    <SelectItem key={group.project_group_id} value={group.project_group_id.toString()}>
                                        {group.project_group_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="meetingPurpose">Purpose</Label>
                        <Input
                            id="meetingPurpose"
                            name="meetingPurpose"
                            placeholder="e.g., Weekly progress review"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="meetingDate">Date & Time</Label>
                        <Input
                            id="meetingDate"
                            name="meetingDate"
                            type="datetime-local"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="meetingLocation">Location (Optional)</Label>
                        <Input
                            id="meetingLocation"
                            name="meetingLocation"
                            placeholder="e.g., Lab 3 or Teams"
                            list="meeting-locations"
                        />
                        <datalist id="meeting-locations">
                            {existingLocations.map((loc, i) => (
                                <option key={i} value={loc} />
                            ))}
                        </datalist>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            name="description"
                            placeholder="e.g., Phase 1 Review"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Scheduling..." : "Schedule Meeting"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
