import { ActivityEvent } from "@/lib/activity-actions"
import { formatDistanceToNow } from "date-fns"
import { 
    FileText, 
    Calendar, 
    MessageSquare, 
    CheckSquare, 
    FileUp, 
    Flag,
    CircleDashed
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ActivityTimelineProps {
    events: ActivityEvent[]
}

const iconMap = {
    report: <FileText className="h-4 w-4" />,
    meeting: <Calendar className="h-4 w-4" />,
    document: <FileUp className="h-4 w-4" />,
    message: <MessageSquare className="h-4 w-4" />,
    milestone: <Flag className="h-4 w-4" />,
    task: <CheckSquare className="h-4 w-4" />,
}

const colorMap = {
    report: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    meeting: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    document: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    message: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    milestone: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    task: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
    if (events.length === 0) {
        return (
            <div className="text-center py-6 text-muted-foreground text-sm">
                No recent activity to show.
            </div>
        )
    }

    return (
        <div className="relative space-y-4 after:absolute after:inset-y-0 after:left-[1.35rem] after:w-px after:bg-border after:content-['']">
            {events.map((event, idx) => (
                <div key={event.id} className="relative pl-12 flex items-center min-h-[44px]">
                    <div className={cn(
                        "absolute left-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border-4 border-background shadow-sm",
                        colorMap[event.type]
                    )}>
                        {iconMap[event.type]}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">{event.title}</span>
                            <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{event.description}</p>
                        {event.userName && (
                            <span className="text-[10px] font-medium text-primary mt-1">
                                By {event.userName}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
