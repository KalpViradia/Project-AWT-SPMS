"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"

interface ProposalFormProps {
    projectTypes: { project_type_id: number; project_type_name: string }[];
    guides: { staff_id: number; staff_name: string }[];
    action: (formData: FormData) => Promise<void>;
}

export function ProposalForm({ projectTypes, guides, action }: ProposalFormProps) {
    const [isPending, setIsPending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);

        const formData = new FormData(event.currentTarget);

        // Add the file if selected
        if (selectedFile) {
            formData.append('proposalFile', selectedFile);
        }

        try {
            await action(formData);
            toast.success("Project proposal submitted successfully!");
            router.push('/dashboard/student');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to submit proposal");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Project Proposal Submission</CardTitle>
                    <CardDescription>
                        Submit your project proposal for faculty review and approval.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Basic Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="groupName">Group Name *</Label>
                            <Input
                                id="groupName"
                                name="groupName"
                                required
                                minLength={3}
                                placeholder="e.g., Team Alpha"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="projectTitle">Project Title *</Label>
                            <Input
                                id="projectTitle"
                                name="projectTitle"
                                required
                                minLength={5}
                                placeholder="e.g., AI-Powered Student Management System"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="projectType">Project Type *</Label>
                                <Select name="projectType" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select project type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projectTypes.map((type) => (
                                            <SelectItem key={type.project_type_id} value={type.project_type_id.toString()}>
                                                {type.project_type_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guideId">Project Guide *</Label>
                                <Select name="guideId" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select guide" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {guides.map((guide) => (
                                            <SelectItem key={guide.staff_id} value={guide.staff_id.toString()}>
                                                {guide.staff_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Project Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Project Details</h3>

                        <div className="space-y-2">
                            <Label htmlFor="description">Project Description *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                required
                                minLength={50}
                                rows={4}
                                placeholder="Provide a detailed description of your project..."
                            />
                            <p className="text-xs text-muted-foreground">Minimum 50 characters</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="objectives">Project Objectives *</Label>
                            <Textarea
                                id="objectives"
                                name="objectives"
                                required
                                minLength={30}
                                rows={4}
                                placeholder="List the key objectives and goals of your project..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="methodology">Methodology *</Label>
                            <Textarea
                                id="methodology"
                                name="methodology"
                                required
                                minLength={30}
                                rows={4}
                                placeholder="Describe the approach and methods you'll use..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expectedOutcomes">Expected Outcomes *</Label>
                            <Textarea
                                id="expectedOutcomes"
                                name="expectedOutcomes"
                                required
                                minLength={30}
                                rows={4}
                                placeholder="Describe the expected results and deliverables..."
                            />
                        </div>
                    </div>

                    {/* Optional Proposal Document */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Supporting Document (Optional)</h3>

                        <div className="space-y-2">
                            <Label htmlFor="proposalFile">Upload Proposal Document</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="proposalFile"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="cursor-pointer"
                                />
                                {selectedFile && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            const fileInput = document.getElementById('proposalFile') as HTMLInputElement;
                                            if (fileInput) fileInput.value = '';
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Accepted formats: PDF, DOC, DOCX. Max size: 5MB
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Upload className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Submit Proposal
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
