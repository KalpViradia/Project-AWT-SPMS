import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Download, FileText } from "lucide-react"

interface ProjectDocument {
    document_id: number;
    title: string;
    file_path: string;
    uploaded_at: Date;
}

interface DocumentsListProps {
    documents: ProjectDocument[];
}

export function DocumentsList({ documents }: DocumentsListProps) {
    if (documents.length === 0) {
        return <div className="text-muted-foreground text-sm py-4">No documents uploaded yet.</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {documents.map((doc) => (
                    <TableRow key={doc.document_id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                {doc.title}
                            </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                            <Button size="sm" variant="ghost" asChild>
                                <a href={doc.file_path} download target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </a>
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
