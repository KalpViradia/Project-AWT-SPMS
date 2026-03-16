import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Download, FileText, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ReviewDocumentDialog } from "@/components/faculty/review-document-dialog"
import { UpdateDocumentDialog } from "@/components/student/update-document-dialog"

interface ProjectDocument {
    document_id: number;
    project_group_id: number;
    title: string;
    file_path: string;
    status: string;
    feedback?: string | null;
    uploaded_at: Date;
}

interface DocumentsListProps {
    documents: ProjectDocument[];
    userRole: 'student' | 'faculty';
}

const statusColors: Record<string, string> = {
    submitted: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    "under review": "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
    "revision required": "bg-destructive/10 text-destructive hover:bg-destructive/20",
    approved: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
}

export function DocumentsList({ documents, userRole }: DocumentsListProps) {
    if (documents.length === 0) {
        return <div className="text-muted-foreground text-sm py-8 text-center border rounded-lg border-dashed">No documents uploaded yet.</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {documents.map((doc) => (
                    <TableRow key={doc.document_id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">{doc.title}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[11px]">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Badge 
                                    variant="secondary" 
                                    className={cn("text-[10px] px-2 py-0 h-5 capitalize whitespace-nowrap", statusColors[doc.status.toLowerCase()] || "bg-muted text-muted-foreground")}
                                >
                                    {doc.status}
                                </Badge>
                                {doc.feedback && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="cursor-help text-muted-foreground hover:text-foreground">
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs text-[11px]">
                                                <p className="font-semibold mb-1">Feedback from Guide:</p>
                                                <p>{doc.feedback}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8" asChild title="Download">
                                    <a href={doc.file_path} download target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                                
                                {userRole === 'student' && (
                                    <UpdateDocumentDialog document={doc} />
                                )}

                                {userRole === 'faculty' && (
                                    <ReviewDocumentDialog document={doc} />
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
