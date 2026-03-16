"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Loader2 } from "lucide-react"
import { updateProjectDetails } from "@/lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ProjectDetails {
    project_group_id: number;
    project_title: string;
    project_description: string | null;
    project_objectives: string | null;
    project_methodology: string | null;
    project_expected_outcomes: string | null;
}

interface EditProjectDetailsDialogProps {
    project: ProjectDetails;
}

export function EditProjectDetailsDialog({ project }: EditProjectDetailsDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.append("groupId", project.project_group_id.toString())

        try {
            const result = await updateProjectDetails(formData)
            if (result.success) {
                toast.success("Project details updated successfully")
                setOpen(false)
                router.refresh()
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update project details")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Edit2 className="h-4 w-4" />
                    Edit Details
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Project Details</DialogTitle>
                        <DialogDescription>
                            Update your project information. Your guide will be notified of these changes.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Project Title</Label>
                            <Input
                                id="title"
                                name="title"
                                defaultValue={project.project_title}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={project.project_description || ""}
                                rows={4}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="objectives">Objectives</Label>
                            <Textarea
                                id="objectives"
                                name="objectives"
                                defaultValue={project.project_objectives || ""}
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="methodology">Methodology</Label>
                            <Textarea
                                id="methodology"
                                name="methodology"
                                defaultValue={project.project_methodology || ""}
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="outcomes">Expected Outcomes</Label>
                            <Textarea
                                id="outcomes"
                                name="outcomes"
                                defaultValue={project.project_expected_outcomes || ""}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
