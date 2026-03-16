"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { SkillsTagInput } from "@/components/ui/skills-tag-input"
import { Edit2, X, Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileUpload } from "@/components/ui/file-upload"
import { useSession } from "next-auth/react"

interface ProfileData {
    name: string;
    email: string;
    phone?: string | null;
    description?: string | null;
    avatar_url?: string | null;
    skills?: string[];
    department_id?: number | null;
    department_name?: string | null;
}

interface ProfileViewEditProps {
    initialData: ProfileData;
    action: (formData: FormData) => Promise<{ success: boolean; avatarUrl?: string | null } | void>;
    role: "student" | "faculty" | "admin";
    departments?: { department_id: number; department_name: string }[];
}

export function ProfileViewEdit({ initialData, action, role, departments }: ProfileViewEditProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [phone, setPhone] = useState(initialData.phone?.replace(/\D/g, '').slice(0, 10) || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const { update } = useSession();

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
        
        if (avatarFile) {
            formData.append('avatarFile', avatarFile);
        }

        try {
            const result = await action(formData);
            
            // Refresh session if a new avatar was uploaded
            if (result && (result as any).avatarUrl) {
                await update({
                    image: (result as any).avatarUrl
                });
            } else if (result && (result as any).success) {
                // Even if no new image, update might be needed for name/other fields if they are in session
                await update();
            }

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
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={initialData.avatar_url || ""} alt={initialData.name} />
                                <AvatarFallback className="text-lg">
                                    {initialData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">{initialData.name}</CardTitle>
                                <CardDescription className="capitalize">
                                    {role}
                                </CardDescription>
                            </div>
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
                            <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                            <p className="text-sm font-medium">{initialData.email}</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                            <p className="text-sm font-medium">{initialData.phone || "Not provided"}</p>
                        </div>
                        {role !== 'admin' && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                                <p className="text-sm font-medium">{initialData.department_name || "Not assigned"}</p>
                            </div>
                        )}
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

                    <div className="space-y-4">
                        <Label>Profile Picture</Label>
                        <FileUpload
                            accept="image/*"
                            value={avatarFile}
                            onChange={setAvatarFile}
                            label="Upload Profile Picture"
                        />
                        <input type="hidden" name="avatarUrl" value={initialData.avatar_url || ""} />
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

                    {role !== 'admin' && departments && (
                        <div className="space-y-2">
                            <Label htmlFor="departmentId">Department</Label>
                            <select
                                id="departmentId"
                                name="departmentId"
                                defaultValue={initialData.department_id || ''}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.department_id} value={dept.department_id}>
                                        {dept.department_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

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
