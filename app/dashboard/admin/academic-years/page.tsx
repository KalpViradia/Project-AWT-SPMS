import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { createAcademicYear, deleteAcademicYear, updateAcademicYear } from "@/lib/admin-actions"
import { Pencil, Trash2, Star } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"

export default async function AcademicYearsPage() {
    const session = await auth()

    if (!session || !session.user) {
        redirect("/", RedirectType.replace)
    }

    const userRole = (session.user as { role?: string }).role
    if (userRole !== "admin") {
        redirect("/", RedirectType.replace)
    }

    const academicYears = await prisma.academic_year.findMany({
        orderBy: { year_name: "desc" },
    })

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Academic Years</h1>
                <p className="text-muted-foreground">Manage academic year periods.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Academic Year</CardTitle>
                    <CardDescription>Create a new academic year period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createAcademicYear} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="yearName">Year Name</Label>
                            <Input id="yearName" name="yearName" placeholder="e.g., 2025-2026" required />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input id="startDate" name="startDate" type="date" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input id="endDate" name="endDate" type="date" />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="hidden" name="isCurrent" value="false" />
                            <Checkbox id="isCurrent" name="isCurrent" value="true" />
                            <Label htmlFor="isCurrent" className="text-sm">Set as Current</Label>
                        </div>
                        <Button type="submit">Add Year</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Academic Years</CardTitle>
                    <CardDescription>View and manage academic years.</CardDescription>
                </CardHeader>
                <CardContent>
                    {academicYears.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No academic years found.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {academicYears.map((year) => (
                                    <TableRow key={year.academic_year_id}>
                                        <TableCell className="font-medium">{year.year_name}</TableCell>
                                        <TableCell>
                                            {year.start_date ? format(new Date(year.start_date), "PP") : "—"}
                                        </TableCell>
                                        <TableCell>
                                            {year.end_date ? format(new Date(year.end_date), "PP") : "—"}
                                        </TableCell>
                                        <TableCell>
                                            {year.is_current ? (
                                                <Badge className="bg-green-500">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    Current
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="icon">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Academic Year</DialogTitle>
                                                            <DialogDescription>Update academic year details.</DialogDescription>
                                                        </DialogHeader>
                                                        <form action={updateAcademicYear} className="space-y-4">
                                                            <input type="hidden" name="id" value={year.academic_year_id} />
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`edit-year-${year.academic_year_id}`}>Year Name</Label>
                                                                <Input
                                                                    id={`edit-year-${year.academic_year_id}`}
                                                                    name="yearName"
                                                                    defaultValue={year.year_name}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`edit-start-${year.academic_year_id}`}>Start Date</Label>
                                                                <Input
                                                                    id={`edit-start-${year.academic_year_id}`}
                                                                    name="startDate"
                                                                    type="date"
                                                                    defaultValue={year.start_date ? format(new Date(year.start_date), "yyyy-MM-dd") : ""}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`edit-end-${year.academic_year_id}`}>End Date</Label>
                                                                <Input
                                                                    id={`edit-end-${year.academic_year_id}`}
                                                                    name="endDate"
                                                                    type="date"
                                                                    defaultValue={year.end_date ? format(new Date(year.end_date), "yyyy-MM-dd") : ""}
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <input type="hidden" name="isCurrent" value="false" />
                                                                <Checkbox
                                                                    id={`edit-current-${year.academic_year_id}`}
                                                                    name="isCurrent"
                                                                    value="true"
                                                                    defaultChecked={year.is_current}
                                                                />
                                                                <Label htmlFor={`edit-current-${year.academic_year_id}`}>Set as Current Year</Label>
                                                            </div>
                                                            <Button type="submit" className="w-full">Save Changes</Button>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                                <form action={deleteAcademicYear}>
                                                    <input type="hidden" name="id" value={year.academic_year_id} />
                                                    <Button variant="outline" size="icon" type="submit">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
