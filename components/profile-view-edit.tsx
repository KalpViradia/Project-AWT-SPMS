"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { SkillsTagInput } from "@/components/ui/skills-tag-input"
import { Edit2, X } from "lucide-react"

interface ProfileData {
    name: string;
    email: string;
    phone?: string | null;
    description?: string | null;
    skills?: string[];
}

interface ProfileViewEditProps {
    initialData: ProfileData;
    action: (formData: FormData) => Promise<void>;
    role: "student" | "faculty";
}

export function ProfileViewEdit({ initialData, action, role }: ProfileViewEditProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [phone, setPhone] = useState(initialData.phone?.replace(/\D/g, '').slice(0, 10) || '');

    // Handle phone input - only allow digits and max 10 characters
    function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length <= 10) {
            setPhone(value);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        const formData = new FormData(event.currentTarget);

        try {
            await action(formData);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
        } finally {
            setIsPending(false);
        }
    }

    if (!isEditing) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Your personal information and contact details.
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                            <p className="text-sm font-medium">{initialData.name}</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                            <p className="text-sm font-medium">{initialData.email}</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                            <p className="text-sm font-medium">{initialData.phone || "Not provided"}</p>
                        </div>
                    </div>
                    {initialData.description && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Bio / Description</Label>
                            <p className="text-sm whitespace-pre-wrap">{initialData.description}</p>
                        </div>
                    )}
                    {initialData.skills && initialData.skills.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Skills</Label>
                            <div className="flex flex-wrap gap-2">
                                {initialData.skills.map((skill, i) => (
                                    <Badge key={i} variant="secondary">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Edit Profile Information</CardTitle>
                        <CardDescription>
                            Update your personal information and contact details.
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        disabled={isPending}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={initialData.name}
                            required
                            minLength={2}
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                            This is your public display name.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            value={initialData.email}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                            Email address cannot be changed.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            pattern="[0-9]{10}"
                            maxLength={10}
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="1234567890"
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                            Enter exactly 10 digits (numbers only)
                        </p>
                        {phone.length > 0 && phone.length < 10 && (
                            <p className="text-xs text-destructive">
                                {10 - phone.length} more digit(s) needed
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Bio / Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={initialData.description || ''}
                            placeholder="Tell us a little bit about yourself"
                            className="resize-none"
                            rows={4}
                        />
                    </div>

                    <SkillsTagInput
                        name="skills"
                        label="Skills"
                        initialSkills={initialData.skills || []}
                    />

                    <div className="flex gap-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
