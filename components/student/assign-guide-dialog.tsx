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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { assignGuide } from "@/lib/actions"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Check } from "lucide-react"
import { SearchSelect } from "@/components/ui/search-select"
import { cn } from "@/lib/utils"

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
    const [guideOpen, setGuideOpen] = useState(false);
    const [guideValue, setGuideValue] = useState("");

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
                        <div className="space-y-2 flex flex-col">
                            <Label htmlFor="guideId">Select Guide</Label>
                            <SearchSelect
                                items={sortedFaculty.map(f => ({
                                    staff_id: f.staff_id,
                                    staff_name: f.staff_name,
                                    matchCount: f.matchCount,
                                    label: f.staff_name,
                                    value: f.staff_id.toString()
                                }))}
                                value={guideValue}
                                onValueChange={setGuideValue}
                                placeholder="Search and select faculty..."
                                name="guideId"
                                renderItem={(item) => (
                                    <div className="flex flex-col">
                                        <span className="font-medium">{item.staff_name}</span>
                                        {item.matchCount > 0 && (
                                            <span className="text-[10px] text-primary">
                                                {item.matchCount} skill match{item.matchCount > 1 ? 'es' : ''}
                                            </span>
                                        )}
                                    </div>
                                )}
                            />
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
