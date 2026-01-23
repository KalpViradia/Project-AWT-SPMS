"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ProfileFormProps {
    initialData: {
        name: string;
        email: string;
        phone?: string | null;
        description?: string | null;
    };
    action: (formData: FormData) => Promise<void>;
    role: "student" | "faculty";
}

export function ProfileForm({ initialData, action, role }: ProfileFormProps) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        const formData = new FormData(event.currentTarget);

        try {
            await action(formData);
            toast.success("Profile updated successfully");
            // Redirect to profile page
            router.push(`/dashboard/${role}/profile`);
            router.refresh(); // Ensure data is fresh
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={initialData.name} required minLength={2} />
                <p className="text-[0.8rem] text-muted-foreground">
                    This is your public display name.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={initialData.email} disabled className="bg-muted" />
                <p className="text-[0.8rem] text-muted-foreground">
                    Email address cannot be changed.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" defaultValue={initialData.phone || ''} placeholder="+1234567890" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Bio / Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={initialData.description || ''}
                    placeholder="Tell us a little bit about yourself"
                    className="resize-none"
                />
            </div>

            <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
            </Button>
        </form>
    )
}
