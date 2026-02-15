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
import { useMemo, useState } from "react"
import { toast } from "sonner"

interface Staff {
    staff_id: number;
    staff_name: string;
    skills: string[];
}

interface AssignGuideDialogProps {
    groupId: number;
    facultyList: Staff[];
    projectSkills?: string[];
}

export function AssignGuideDialog({ groupId, facultyList, projectSkills = [] }: AssignGuideDialogProps) {
    const [open, setOpen] = useState(false);

    // Sort faculty by skill overlap with project skills
    const sortedFaculty = useMemo(() => {
        if (projectSkills.length === 0) return facultyList.map(f => ({ ...f, matchCount: 0 }));
        const lowerProjectSkills = projectSkills.map(s => s.toLowerCase());
        return facultyList
            .map(faculty => {
                const matchCount = faculty.skills.filter(s =>
                    lowerProjectSkills.includes(s.toLowerCase())
                ).length;
                return { ...faculty, matchCount };
            })
            .sort((a, b) => b.matchCount - a.matchCount);
    }, [facultyList, projectSkills]);

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
                        {projectSkills.length > 0 && " Guides with matching skills are shown first."}
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
                                    {sortedFaculty.map((faculty) => (
                                        <SelectItem key={faculty.staff_id} value={faculty.staff_id.toString()}>
                                            {faculty.staff_name}
                                            {faculty.matchCount > 0 && (
                                                <span className="ml-2 text-xs text-primary">
                                                    ({faculty.matchCount} skill match{faculty.matchCount > 1 ? 'es' : ''})
                                                </span>
                                            )}
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
