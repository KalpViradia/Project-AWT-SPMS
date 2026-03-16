"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { submitReport } from "@/lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface SubmitReportFormProps {
    groupId: number;
    projectTitle: string;
    onSuccess?: () => void;
}

export function SubmitReportForm({ groupId, projectTitle, onSuccess }: SubmitReportFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        
        try {
            await submitReport(formData)
            toast.success(`Report for ${projectTitle} submitted successfully`)
            event.currentTarget.reset()
            if (onSuccess) onSuccess()
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to submit report")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="groupId" value={groupId} />
            <div className="space-y-2">
                <Label htmlFor="weekNumber">Week Number</Label>
                <Input
                    id="weekNumber"
                    name="weekNumber"
                    type="number"
                    min="1"
                    max="52"
                    required
                    placeholder="e.g., 1"
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="content">Report Content</Label>
                <Textarea
                    id="content"
                    name="content"
                    required
                    minLength={10}
                    placeholder="Describe your progress, challenges, and plans for next week..."
                    className="min-h-[150px]"
                    disabled={isLoading}
                />
                <p className="text-[10px] text-muted-foreground italic">
                    Min. 10 characters required.
                </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    "Submit Report"
                )}
            </Button>
        </form>
    )
}
