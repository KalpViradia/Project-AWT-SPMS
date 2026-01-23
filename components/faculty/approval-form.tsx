"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { approveGroup } from "@/lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"

interface ApprovalFormProps {
    groupId: number;
}

export function ApprovalForm({ groupId }: ApprovalFormProps) {
    const [isPending, setIsPending] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const router = useRouter();

    async function handleApprove() {
        setIsPending(true);
        const formData = new FormData();
        formData.append('groupId', groupId.toString());
        formData.append('action', 'approve');

        try {
            await approveGroup(formData);
            toast.success("Proposal approved successfully!");
            router.push('/dashboard/faculty/groups');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to approve proposal");
        } finally {
            setIsPending(false);
        }
    }

    async function handleReject() {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        setIsPending(true);
        const formData = new FormData();
        formData.append('groupId', groupId.toString());
        formData.append('action', 'reject');
        formData.append('rejectionReason', rejectionReason);

        try {
            await approveGroup(formData);
            toast.success("Proposal rejected");
            router.push('/dashboard/faculty/groups');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to reject proposal");
        } finally {
            setIsPending(false);
        }
    }

    if (showRejectForm) {
        return (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Reject Proposal
                    </CardTitle>
                    <CardDescription>
                        Please provide a reason for rejecting this proposal.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                        <Textarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Explain why this proposal is being rejected..."
                            rows={4}
                            disabled={isPending}
                        />
                        <p className="text-xs text-muted-foreground">
                            This message will be visible to students.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowRejectForm(false);
                            setRejectionReason("");
                        }}
                        disabled={isPending}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isPending || !rejectionReason.trim()}
                        className="flex-1"
                    >
                        {isPending ? "Rejecting..." : "Confirm Rejection"}
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Review Decision</CardTitle>
                <CardDescription>
                    Approve or reject this project proposal.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                    disabled={isPending}
                >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve Proposal
                </Button>
                <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowRejectForm(true)}
                    disabled={isPending}
                >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Proposal
                </Button>
            </CardContent>
        </Card>
    );
}
