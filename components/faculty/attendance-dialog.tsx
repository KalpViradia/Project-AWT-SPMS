"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { markAttendance } from "@/lib/actions"
import { toast } from "sonner"
import { ClipboardCheck } from "lucide-react"

interface Student {
    student_id: number;
    student_name: string;
}

interface AttendanceDialogProps {
    meetingId: number;
    students: Student[];
}

export function AttendanceDialog({ meetingId, students }: AttendanceDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [attendance, setAttendance] = useState<Record<number, boolean>>(
        students.reduce((acc, student) => ({ ...acc, [student.student_id]: true }), {})
    )

    async function handleAction() {
        setIsPending(true)
        const attendanceData = students.map(student => ({
            studentId: student.student_id,
            isPresent: attendance[student.student_id] || false,
            remarks: ""
        }))

        const formData = new FormData()
        formData.append("meetingId", meetingId.toString())
        formData.append("attendanceData", JSON.stringify(attendanceData))

        try {
            await markAttendance(formData)
            setOpen(false)
            toast.success("Attendance marked successfully")
        } catch (error) {
            toast.error("Failed to mark attendance")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Attendance
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Mark Attendance</DialogTitle>
                    <DialogDescription>
                        Mark students present for this meeting.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {students.map(student => (
                        <div key={student.student_id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`student-${student.student_id}`}
                                checked={attendance[student.student_id]}
                                onCheckedChange={(checked) => {
                                    setAttendance(prev => ({ ...prev, [student.student_id]: !!checked }))
                                }}
                            />
                            <Label htmlFor={`student-${student.student_id}`}>{student.student_name}</Label>
                        </div>
                    ))}
                </div>
                <Button onClick={handleAction} className="w-full" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Attendance"}
                </Button>
            </DialogContent>
        </Dialog>
    )
}
