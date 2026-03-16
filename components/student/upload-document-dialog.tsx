"use client"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Upload, FileText } from "lucide-react"
import { toast } from "sonner"
import { uploadDocument } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { FileUpload } from "@/components/ui/file-upload"

interface UploadDocumentDialogProps {
    groupId: number;
}

export function UploadDocumentDialog({ groupId }: UploadDocumentDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const router = useRouter()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!selectedFile) {
            toast.error("Please select a file to upload")
            return
        }

        setIsLoading(true)
        const formData = new FormData(event.currentTarget)
        formData.append('groupId', groupId.toString())
        formData.append('file', selectedFile)

        try {
            await uploadDocument(formData)
            toast.success("Document uploaded successfully")
            setOpen(false)
            setSelectedFile(null)
            router.refresh()
        } catch (error) {
            toast.error("Failed to upload document")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>
                            Upload project proposals, reports, or other relevant documents.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-6 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Document Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g. Project Proposal"
                                required
                                minLength={3}
                            />
                        </div>
                        
                        <FileUpload
                            label="Document File"
                            accept=".pdf,.doc,.docx"
                            value={selectedFile}
                            onChange={setSelectedFile}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? "Uploading..." : "Upload Document"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

