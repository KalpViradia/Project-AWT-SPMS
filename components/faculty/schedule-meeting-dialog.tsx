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
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { scheduleMeeting } from "@/lib/actions"
import { toast } from "sonner"
import { Check } from "lucide-react"
import { SearchSelect } from "@/components/ui/search-select"
import { cn } from "@/lib/utils"

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
    const [groupOpen, setGroupOpen] = useState(false)
    const [groupValue, setGroupValue] = useState("")

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
                    <div className="space-y-2 flex flex-col">
                        <Label htmlFor="group">Project Group</Label>
                        <SearchSelect
                            items={groups.map(g => ({
                                label: g.project_group_name,
                                value: g.project_group_id.toString()
                            }))}
                            value={groupValue}
                            onValueChange={setGroupValue}
                            placeholder="Search and select group..."
                            name="projectGroupId"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="meetingPurpose">Purpose (Optional)</Label>
                        <Input
                            id="meetingPurpose"
                            name="meetingPurpose"
                            placeholder="e.g., Weekly progress review"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="meetingDate">Date & Time</Label>
                        <DateTimePicker
                            name="meetingDate"
                            placeholder="Select meeting date & time"
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
