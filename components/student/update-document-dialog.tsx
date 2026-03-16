"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RefreshCw, Loader2 } from "lucide-react"
import { uploadDocument } from "@/lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { FileUpload } from "@/components/ui/file-upload"

interface UpdateDocumentDialogProps {
    document: {
        document_id: number;
        project_group_id: number;
        title: string;
    };
}

export function UpdateDocumentDialog({ document }: UpdateDocumentDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!selectedFile) {
            toast.error("Please select a file")
            return
        }

        setLoading(true)

        const formData = new FormData()
        formData.append("groupId", document.project_group_id.toString())
        formData.append("documentId", document.document_id.toString())
        formData.append("title", document.title)
        formData.append("file", selectedFile)

        try {
            await uploadDocument(formData)
            toast.success("Document updated successfully")
            setOpen(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to update document")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" title="Update / Replace">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Update Document</DialogTitle>
                        <DialogDescription>
                            Upload a new version of "{document.title}". This will replace the previous file.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <FileUpload
                            label="New Document File"
                            accept=".pdf,.doc,.docx"
                            value={selectedFile}
                            onChange={setSelectedFile}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upload New Version
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
