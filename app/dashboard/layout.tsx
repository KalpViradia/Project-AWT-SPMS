import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import { auth } from "@/auth"
import { SidebarProvider } from "@/components/sidebar-provider"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"

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
        <SidebarProvider>
            <DashboardLayoutClient role={role}>
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-6">
                    <div className="flex flex-1 items-center gap-4">
                        {/* Mobile Sidebar Trigger could go here in future */}
                        <h2 className="text-lg font-semibold">{getDashboardTitle(role)}</h2>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        <ModeToggle />
                        <UserNav />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </DashboardLayoutClient>
        </SidebarProvider>
    )
}
