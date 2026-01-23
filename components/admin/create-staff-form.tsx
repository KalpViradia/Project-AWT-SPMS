"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createStaff } from "@/lib/admin-actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function CreateStaffForm() {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            await createStaff(formData);
            toast.success("Staff created successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create staff");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="f-name">Name</Label>
                <Input id="f-name" name="name" required placeholder="Dr. Jane Smith" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="f-email">Email</Label>
                <Input id="f-email" name="email" type="email" required placeholder="faculty@example.com" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="faculty">
                    <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="f-password">Password</Label>
                <Input id="f-password" name="password" type="password" required minLength={6} />
            </div>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Staff
            </Button>
        </form>
    )
}
