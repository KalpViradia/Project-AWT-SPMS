"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, Briefcase, User } from "lucide-react"

interface StudentProfileDialogProps {
  student: {
    student_id: number;
    student_name: string;
    email: string | null;
    phone: string | null;
    description: string | null;
    avatar_url: string | null;
    skills: string[];
    group: { name: string; project: string } | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentProfileDialog({ student, open, onOpenChange }: StudentProfileDialogProps) {
  if (!student) return null;

  const initials = student.student_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Student Profile</DialogTitle>
          <DialogDescription>
            Detailed information about {student.student_name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage src={student.avatar_url || ""} alt={student.student_name} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">{student.student_name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" /> {student.email || "No email provided"}
              </p>
              {student.phone && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {student.phone}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4" /> About
            </h4>
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border">
              {student.description || "No bio provided."}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {student.skills.length > 0 ? (
                student.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No skills listed.</span>
              )}
            </div>
          </div>

          {student.group && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Current Project
              </h4>
              <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                <div className="font-medium">{student.group.name}</div>
                <div className="text-sm text-muted-foreground">{student.group.project}</div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
