"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { assignGuide } from "@/lib/actions"
import { useState } from "react"
import { toast } from "sonner"

interface Staff {
    staff_id: number;
    staff_name: string;
}

interface AssignGuideDialogProps {
    groupId: number;
    facultyList: Staff[];
}

export function AssignGuideDialog({ groupId, facultyList }: AssignGuideDialogProps) {
    const [open, setOpen] = useState(false);

    async function handleAction(formData: FormData) {
        try {
            await assignGuide(formData);
            setOpen(false);
            toast.success("Guide assigned successfully");
        } catch (error) {
            toast.error("Failed to assign guide");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Assign Guide</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Project Guide</DialogTitle>
                    <DialogDescription>
                        Select a faculty member to guide your project.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleAction}>
                    <input type="hidden" name="groupId" value={groupId} />
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="guideId">Select Guide</Label>
                            <Select name="guideId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select faculty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {facultyList.map((faculty) => (
                                        <SelectItem key={faculty.staff_id} value={faculty.staff_id.toString()}>
                                            {faculty.staff_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Assign Guide</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
