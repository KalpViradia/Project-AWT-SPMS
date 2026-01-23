import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import { AppSidebar } from "@/components/app-sidebar"
import { auth } from "@/auth"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const role = (session?.user as any)?.role

    const getDashboardTitle = (role: string) => {
        if (!role) return "Project Tracker"
        const formattedRole = role.charAt(0).toUpperCase() + role.slice(1)
        return `${formattedRole} Dashboard`
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-none border-r bg-muted/40 hidden md:block">
                <AppSidebar />
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-6">
                    <div className="flex flex-1 items-center gap-4">
                        {/* Mobile Sidebar Trigger could go here */}
                        <h2 className="text-lg font-semibold">{getDashboardTitle(role)}</h2>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        <ModeToggle />
                        <UserNav />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
