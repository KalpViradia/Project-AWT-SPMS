"use client"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import Link from "next/link"

interface PendingGroup {
    project_group_id: number
    project_group_name: string
    project_title: string
    project_type: { project_type_name: string }
    project_group_member: {
        student: { student_name: string }
        is_group_leader: boolean
    }[]
    created_at: Date
}

export function PendingGroupsList({ groups }: { groups: PendingGroup[] }) {
    if (groups.length === 0) return null

    return (
        <div className="rounded-md border border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-900">
            <div className="p-4">
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200">Pending Approvals ({groups.length})</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">Review and approve project proposals from your assigned groups.</p>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Group Name</TableHead>
                        <TableHead>Project Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groups.map((group) => (
                        <TableRow key={group.project_group_id}>
                            <TableCell className="font-medium">{group.project_group_name}</TableCell>
                            <TableCell>{group.project_title}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{group.project_type.project_type_name}</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    {group.project_group_member.slice(0, 2).map((member, i) => (
                                        <span key={i} className="text-xs">
                                            {member.student.student_name} {member.is_group_leader && "(Leader)"}
                                        </span>
                                    ))}
                                    {group.project_group_member.length > 2 && (
                                        <span className="text-xs text-muted-foreground">
                                            +{group.project_group_member.length - 2} more
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(group.created_at).toLocaleDateString()}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    size="sm"
                                    variant="default"
                                    asChild
                                >
                                    <Link href={`/dashboard/faculty/proposals/${group.project_group_id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Review
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
