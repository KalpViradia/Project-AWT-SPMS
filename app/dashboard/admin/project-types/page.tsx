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
import { createProjectType, deleteProjectType, updateProjectType } from "@/lib/admin-actions"
import { Pencil, Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default async function ProjectTypesPage() {
    const session = await auth()

    if (!session || !session.user) {
        redirect("/", RedirectType.replace)
    }

    const userRole = (session.user as { role?: string }).role
    if (userRole !== "admin") {
        redirect("/", RedirectType.replace)
    }

    const projectTypes = await prisma.project_type.findMany({
        orderBy: { project_type_name: "asc" },
        include: {
            _count: {
                select: { project_group: true }
            }
        }
    })

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Project Types</h1>
                <p className="text-muted-foreground">Manage project categories (Major, Mini, Research, etc.)</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Project Type</CardTitle>
                    <CardDescription>Create a new category for projects.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createProjectType} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="name">Type Name</Label>
                            <Input id="name" name="name" placeholder="e.g., Major Project" required />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input id="description" name="description" placeholder="Brief description" />
                        </div>
                        <Button type="submit">Add Type</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Project Types</CardTitle>
                    <CardDescription>View and manage all project types.</CardDescription>
                </CardHeader>
                <CardContent>
                    {projectTypes.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No project types found.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Projects</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projectTypes.map((type) => (
                                    <TableRow key={type.project_type_id}>
                                        <TableCell className="font-medium">{type.project_type_name}</TableCell>
                                        <TableCell className="text-muted-foreground">{type.description || "—"}</TableCell>
                                        <TableCell>{type._count.project_group}</TableCell>
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
                                                            <DialogTitle>Edit Project Type</DialogTitle>
                                                            <DialogDescription>Update the project type details.</DialogDescription>
                                                        </DialogHeader>
                                                        <form action={updateProjectType} className="space-y-4">
                                                            <input type="hidden" name="id" value={type.project_type_id} />
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`edit-name-${type.project_type_id}`}>Name</Label>
                                                                <Input
                                                                    id={`edit-name-${type.project_type_id}`}
                                                                    name="name"
                                                                    defaultValue={type.project_type_name}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`edit-desc-${type.project_type_id}`}>Description</Label>
                                                                <Textarea
                                                                    id={`edit-desc-${type.project_type_id}`}
                                                                    name="description"
                                                                    defaultValue={type.description || ""}
                                                                />
                                                            </div>
                                                            <Button type="submit" className="w-full">Save Changes</Button>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                                <form action={deleteProjectType}>
                                                    <input type="hidden" name="id" value={type.project_type_id} />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        type="submit"
                                                        disabled={type._count.project_group > 0}
                                                        title={type._count.project_group > 0 ? "Cannot delete: type has projects" : "Delete"}
                                                    >
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
