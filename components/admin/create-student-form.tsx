"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createStudent } from "@/lib/admin-actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function CreateStudentForm() {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            await createStudent(formData);
            toast.success("Student created successfully");
            // Optional: reset form
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create student");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="s-name">Name</Label>
                <Input id="s-name" name="name" required placeholder="John Doe" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="s-email">Email</Label>
                <Input id="s-email" name="email" type="email" required placeholder="student@example.com" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="s-password">Password</Label>
                <Input id="s-password" name="password" type="password" required minLength={6} />
            </div>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Student
            </Button>
        </form>
    )
}
