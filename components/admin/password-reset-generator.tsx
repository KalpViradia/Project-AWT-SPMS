"use client"

import { useState, useTransition } from "react"
import { generateResetToken } from "@/lib/password-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Copy, KeyRound, Loader2 } from "lucide-react"

export function PasswordResetGenerator() {
    const [userId, setUserId] = useState("")
    const [userRole, setUserRole] = useState<string>("student")
    const [resetLink, setResetLink] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleGenerate = () => {
        if (!userId || isNaN(parseInt(userId))) {
            toast.error("Please enter a valid user ID.")
            return
        }

        startTransition(async () => {
            try {
                const result = await generateResetToken(parseInt(userId), userRole)
                const link = `${window.location.origin}/reset-password/${result.token}`
                setResetLink(link)
                toast.success("Reset link generated! Share it with the user.")
            } catch (error: any) {
                toast.error(error.message || "Failed to generate reset link.")
            }
        })
    }

    const copyLink = () => {
        if (resetLink) {
            navigator.clipboard.writeText(resetLink)
            toast.success("Link copied to clipboard!")
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="resetUserId">User ID</Label>
                    <Input
                        id="resetUserId"
                        type="number"
                        placeholder="Enter user ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="resetRole">Role</Label>
                    <Select value={userRole} onValueChange={setUserRole}>
                        <SelectTrigger id="resetRole">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="faculty">Faculty</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Button onClick={handleGenerate} disabled={isPending}>
                {isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                    <><KeyRound className="mr-2 h-4 w-4" /> Generate Reset Link</>
                )}
            </Button>

            {resetLink && (
                <div className="mt-4 p-3 border rounded-lg bg-muted/50 space-y-2">
                    <p className="text-sm font-medium">Reset Link (valid for 24 hours):</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-background px-3 py-2 rounded border break-all">
                            {resetLink}
                        </code>
                        <Button variant="outline" size="icon" onClick={copyLink}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
