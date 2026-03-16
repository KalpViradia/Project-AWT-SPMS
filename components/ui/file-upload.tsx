"use client"

import * as React from "react"
import { Upload, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface FileUploadProps {
  label?: string
  accept?: string
  onChange?: (file: File | null) => void
  value?: File | null
  className?: string
  required?: boolean
}

export function FileUpload({
  label,
  accept,
  onChange,
  value,
  className,
  required
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (onChange) onChange(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (onChange) onChange(file)
    }
  }

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onChange) onChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      {label && <Label className="text-sm font-semibold">{label}</Label>}
      
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-center",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50",
          value && "border-primary/50 bg-primary/5"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          required={required && !value}
        />

        {value ? (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium max-w-[200px] truncate">{value.name}</p>
              <p className="text-xs text-muted-foreground">{(value.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={clearFile}
            >
              <X className="h-4 w-4 mr-2" />
              Remove File
            </Button>
          </div>
        ) : (
          <>
            <div className="p-3 rounded-full bg-muted text-muted-foreground group-hover:text-primary transition-colors">
              <Upload className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Click or drag & drop to upload</p>
              <p className="text-xs text-muted-foreground"> {accept ? `Accepted formats: ${accept}` : 'All formats supported'} </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
