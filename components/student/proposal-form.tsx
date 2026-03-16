"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Upload, Check } from "lucide-react"
import { SkillsTagInput } from "@/components/ui/skills-tag-input"
import { FileUpload } from "@/components/ui/file-upload"
import { SearchSelect } from "@/components/ui/search-select"
import { cn } from "@/lib/utils"

interface ProposalFormProps {
    projectTypes: { project_type_id: number; project_type_name: string }[];
    guides: { staff_id: number; staff_name: string; skills: string[] }[];
    action: (formData: FormData) => Promise<void>;
}

export function ProposalForm({ projectTypes, guides, action }: ProposalFormProps) {
    const [isPending, setIsPending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [projectSkills, setProjectSkills] = useState<string[]>([]);
    const [guideOpen, setGuideOpen] = useState(false);
    const [guideValue, setGuideValue] = useState("");
    const router = useRouter();

    // Sort guides by skill overlap with project skills
    const sortedGuides = useMemo(() => {
        if (projectSkills.length === 0) return guides.map(g => ({ ...g, matchCount: 0 }));
        const lowerProjectSkills = projectSkills.map(s => s.toLowerCase());
        return guides
            .map(guide => {
                const matchCount = guide.skills.filter(s =>
                    lowerProjectSkills.includes(s.toLowerCase())
                ).length;
                return { ...guide, matchCount };
            })
            .sort((a, b) => b.matchCount - a.matchCount);
    }, [guides, projectSkills]);

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

                            <div className="space-y-2 flex flex-col pt-1">
                                <Label htmlFor="guideId">Project Guide *</Label>
                                <SearchSelect
                                    items={sortedGuides.map(g => ({
                                        staff_id: g.staff_id,
                                        staff_name: g.staff_name,
                                        matchCount: g.matchCount,
                                        label: g.staff_name,
                                        value: g.staff_id.toString()
                                    }))}
                                    value={guideValue}
                                    onValueChange={setGuideValue}
                                    placeholder="Search and select project guide..."
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

                        <SkillsTagInput
                            name="projectSkills"
                            label="Project Skills / Technologies *"
                            placeholder="e.g. React, Python, Machine Learning"
                            onChange={setProjectSkills}
                        />
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

                        <FileUpload
                            label="Upload Proposal Document"
                            accept=".pdf,.doc,.docx"
                            value={selectedFile}
                            onChange={setSelectedFile}
                        />
                        <p className="text-xs text-muted-foreground">
                            Accepted formats: PDF, DOC, DOCX. Max size: 5MB
                        </p>
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
