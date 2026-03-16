"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SkillsTagInput } from "@/components/ui/skills-tag-input"
import { searchStudentsBySkills } from "@/lib/actions"
import { Search, Users, ExternalLink } from "lucide-react"
import { StudentProfileDialog } from "./student-profile-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StudentResult {
    student_id: number;
    student_name: string;
    email: string | null;
    phone: string | null;
    description: string | null;
    avatar_url: string | null;
    skills: string[];
    group: { name: string; project: string } | null;
}

export function StudentSearchBySkills() {
    const [skills, setSkills] = useState<string[]>([])
    const [results, setResults] = useState<StudentResult[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    function handleSearch() {
        if (skills.length === 0) return
        startTransition(async () => {
            try {
                const data = await searchStudentsBySkills(skills)
                setResults(data)
                setHasSearched(true)
            } catch (error) {
                console.error("Search failed:", error)
            }
        })
    }

    function handleViewProfile(student: StudentResult) {
        setSelectedStudent(student)
        setIsDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search by Skills
                    </CardTitle>
                    <CardDescription>
                        Enter skills to find students with matching expertise.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SkillsTagInput
                        name="searchSkills"
                        label="Skills to search for"
                        placeholder="e.g. React, Python, Machine Learning"
                        onChange={setSkills}
                    />
                    <Button onClick={handleSearch} disabled={isPending || skills.length === 0}>
                        {isPending ? "Searching..." : "Search Students"}
                    </Button>
                </CardContent>
            </Card>

            {hasSearched && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Results ({results.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {results.length === 0 ? (
                            <p className="text-muted-foreground text-center py-6">
                                No students found with the selected skills.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Skills</TableHead>
                                        <TableHead>Group</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((student) => {
                                        const initials = student.student_name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2);

                                        return (
                                            <TableRow key={student.student_id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={student.avatar_url || ""} alt={student.student_name} />
                                                            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                                                        </Avatar>
                                                        {student.student_name}
                                                    </div>
                                                </TableCell>
                                            <TableCell>{student.email || "—"}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {student.skills.map((skill, i) => (
                                                        <Badge
                                                            key={i}
                                                            variant={skills.some(s => s.toLowerCase() === skill.toLowerCase()) ? "default" : "secondary"}
                                                            className="text-xs"
                                                        >
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {student.group ? (
                                                    <div className="text-sm">
                                                        <div className="font-medium">{student.group.name}</div>
                                                        <div className="text-muted-foreground">{student.group.project}</div>
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline">No group</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewProfile(student)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    <span className="sr-only">View Profile</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            <StudentProfileDialog
                student={selectedStudent}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </div>
    )
}
