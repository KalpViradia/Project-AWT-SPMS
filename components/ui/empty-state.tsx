import * as React from "react"
import { cn } from "@/lib/utils"
import { FileQuestion, FolderOpen, Inbox, SearchX } from "lucide-react"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    description?: string
    icon?: "inbox" | "folder" | "file" | "search" | React.ReactNode
    action?: React.ReactNode
}

export function EmptyState({
    title,
    description,
    icon = "inbox",
    action,
    className,
    ...props
}: EmptyStateProps) {
    
    let IconComponent = null;
    if (icon === "inbox") IconComponent = <Inbox className="h-12 w-12 text-muted-foreground/30" />
    else if (icon === "folder") IconComponent = <FolderOpen className="h-12 w-12 text-muted-foreground/30" />
    else if (icon === "file") IconComponent = <FileQuestion className="h-12 w-12 text-muted-foreground/30" />
    else if (icon === "search") IconComponent = <SearchX className="h-12 w-12 text-muted-foreground/30" />
    else IconComponent = icon

    return (
        <div
            className={cn(
                "flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/5 p-8 text-center animate-in fade-in-50",
                className
            )}
            {...props}
        >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/20 mb-4">
                {IconComponent}
            </div>
            
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            
            {description && (
                <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
                    {description}
                </p>
            )}
            
            {action && (
                <div className="mt-4">
                    {action}
                </div>
            )}
        </div>
    )
}
