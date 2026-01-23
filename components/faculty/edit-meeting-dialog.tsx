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
import { updateMeeting } from "@/lib/actions"
import { toast } from "sonner"
import { Pencil } from "lucide-react"

interface EditMeetingDialogProps {
    meeting: {
        project_meeting_id: number;
        meeting_datetime: Date | string;
        description: string | null;
        meeting_status: string | null;
        meeting_purpose: string | null;
        meeting_location: string | null;
        meeting_status_description: string | null;
    };
}

export function EditMeetingDialog({ meeting }: EditMeetingDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const formattedDate = new Date(meeting.meeting_datetime).toISOString().slice(0, 16);

    async function handleAction(formData: FormData) {
        setIsPending(true)
        try {
            await updateMeeting(formData)
            setOpen(false)
            toast.success("Meeting updated successfully")
        } catch (error) {
            toast.error("Failed to update meeting")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit Meeting</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Meeting</DialogTitle>
                    <DialogDescription>
                        Update meeting details.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleAction} className="space-y-4">
                    <input type="hidden" name="meetingId" value={meeting.project_meeting_id} />
                    <div className="space-y-2">
                        <Label htmlFor="edit-meetingPurpose">Purpose</Label>
                        <Input
                            id="edit-meetingPurpose"
                            name="meetingPurpose"
                            defaultValue={meeting.meeting_purpose || ""}
                            placeholder="e.g., Weekly review"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-meetingDate">Date & Time</Label>
                        <Input
                            id="edit-meetingDate"
                            name="meetingDate"
                            type="datetime-local"
                            defaultValue={formattedDate}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-meetingLocation">Location</Label>
                        <Input
                            id="edit-meetingLocation"
                            name="meetingLocation"
                            defaultValue={meeting.meeting_location || ""}
                            placeholder="e.g., Lab 3 or Teams"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Input
                            id="edit-description"
                            name="description"
                            defaultValue={meeting.description || ""}
                            placeholder="e.g., Phase 1 Review"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-status">Status</Label>
                        <select
                            id="edit-status"
                            name="status"
                            defaultValue={meeting.meeting_status || "scheduled"}
                            className="border border-input bg-background text-sm rounded-md px-2 py-1 w-full"
                        >
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-statusDescription">Status Description (Optional)</Label>
                        <Input
                            id="edit-statusDescription"
                            name="statusDescription"
                            defaultValue={meeting.meeting_status_description || ""}
                            placeholder="e.g., Cancelled due to exam"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Updating..." : "Update Meeting"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
