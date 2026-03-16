import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <div className="text-center p-8 max-w-md w-full bg-card rounded-lg shadow-lg border">
                <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-6" />
                <h1 className="text-3xl font-bold tracking-tight mb-2">Unauthorized Access</h1>
                <p className="text-muted-foreground mb-8">
                    You do not have permission to view this page. If you believe this is an error, please contact your administrator or try logging in again.
                </p>
                <div className="flex flex-col gap-3">
                    <Button asChild className="w-full">
                        <Link href="/dashboard">
                            Go to Dashboard
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                        <Link href="/">
                            Return Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
