import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import { GoBackButton } from "@/components/go-back-button"

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-4">
            {/* Animated 404 number */}
            <div className="mb-8 select-none flex flex-col items-center">
                <FileQuestion className="h-16 w-16 sm:h-20 sm:w-20 text-primary/40 animate-pulse mb-4" />
                <span className="text-[10rem] sm:text-[14rem] font-black leading-none tracking-tighter bg-gradient-to-b from-primary/80 to-primary/20 bg-clip-text text-transparent">
                    404
                </span>
            </div>

            {/* Message */}
            <div className="text-center space-y-3 mb-10 max-w-md">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Page not found
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Check the URL or head back to a familiar place.
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button asChild size="lg">
                    <Link href="/" className="gap-2">
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
                <GoBackButton />
            </div>

            {/* Decorative gradient orbs */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
            </div>
        </div>
    )
}
