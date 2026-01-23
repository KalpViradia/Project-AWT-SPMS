import { Badge } from "@/components/ui/badge"

interface ProposalStatusBadgeProps {
    status: string;
}

export function ProposalStatusBadge({ status }: ProposalStatusBadgeProps) {
    const statusConfig = {
        pending: {
            variant: "secondary" as const,
            label: "Pending Review",
            className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        },
        approved: {
            variant: "default" as const,
            label: "Approved",
            className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        },
        rejected: {
            variant: "destructive" as const,
            label: "Rejected",
            className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <Badge variant={config.variant} className={config.className}>
            {config.label}
        </Badge>
    );
}
