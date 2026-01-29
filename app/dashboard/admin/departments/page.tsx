import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RedirectType, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { createDepartment, deleteDepartment, updateDepartment } from "@/lib/admin-actions"
import { Pencil, Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default async function DepartmentsPage() {
    const session = await auth()

    if (!session || !session.user) {
        redirect("/", RedirectType.replace)
    }

    const userRole = (session.user as { role?: string }).role
    if (userRole !== "admin") {
        redirect("/", RedirectType.replace)
    }

    const departments = await prisma.department.findMany({
        orderBy: { department_name: "asc" },
    })

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
                <p className="text-muted-foreground">Manage academic departments.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Department</CardTitle>
                    <CardDescription>Create a new academic department.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createDepartment} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="name">Department Name</Label>
                            <Input id="name" name="name" placeholder="e.g., Computer Science" required />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="code">Code (Optional)</Label>
                            <Input id="code" name="code" placeholder="e.g., CS" />
                        </div>
                        <Button type="submit">Add Department</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Departments</CardTitle>
                    <CardDescription>View and manage all departments.</CardDescription>
                </CardHeader>
                <CardContent>
                    {departments.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No departments found.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departments.map((dept) => (
                                    <TableRow key={dept.department_id}>
                                        <TableCell className="font-medium">{dept.department_name}</TableCell>
                                        <TableCell className="text-muted-foreground">{dept.department_code || "—"}</TableCell>
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
                                                            <DialogTitle>Edit Department</DialogTitle>
                                                            <DialogDescription>Update department details.</DialogDescription>
                                                        </DialogHeader>
                                                        <form action={updateDepartment} className="space-y-4">
                                                            <input type="hidden" name="id" value={dept.department_id} />
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`edit-name-${dept.department_id}`}>Name</Label>
                                                                <Input
                                                                    id={`edit-name-${dept.department_id}`}
                                                                    name="name"
                                                                    defaultValue={dept.department_name}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`edit-code-${dept.department_id}`}>Code</Label>
                                                                <Input
                                                                    id={`edit-code-${dept.department_id}`}
                                                                    name="code"
                                                                    defaultValue={dept.department_code || ""}
                                                                />
                                                            </div>
                                                            <Button type="submit" className="w-full">Save Changes</Button>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                                <form action={deleteDepartment}>
                                                    <input type="hidden" name="id" value={dept.department_id} />
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
