"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { respondToInvitation } from "@/lib/actions"
import { toast } from "sonner"
import { format } from "date-fns"

interface Invitation {
    invitation_id: number;
    project_group: {
        project_group_name: string;
        project_title: string;
    };
    created_at: Date;
}

interface InvitationsListProps {
    invitations: Invitation[];
}

export function InvitationsList({ invitations }: InvitationsListProps) {
    async function handleResponse(invitationId: number, action: "accept" | "reject") {
        const formData = new FormData();
        formData.append("invitationId", invitationId.toString());
        formData.append("action", action);

        try {
            await respondToInvitation(formData);
            toast.success(action === "accept" ? "Invitation accepted" : "Invitation rejected");
        } catch (error) {
            toast.error("Failed to process invitation");
        }
    }

    if (invitations.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                    <p>You have no pending invitations to join any groups.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Pending Invitations</CardTitle>
                <CardDescription>
                    You have been invited to join the following groups.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {invitations.map((invitation) => (
                    <div
                        key={invitation.invitation_id}
                        className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm"
                    >
                        <div className="space-y-1">
                            <h4 className="font-semibold text-foreground">{invitation.project_group.project_group_name}</h4>
                            <p className="text-sm text-muted-foreground">{invitation.project_group.project_title}</p>
                            <p className="text-xs text-muted-foreground">
                                Received {format(new Date(invitation.created_at), "PPP")}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <form action={() => handleResponse(invitation.invitation_id, "reject")}>
                                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    Reject
                                </Button>
                            </form>
                            <form action={() => handleResponse(invitation.invitation_id, "accept")}>
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                    Accept
                                </Button>
                            </form>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
