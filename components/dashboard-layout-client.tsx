"use client"

import { useSidebar } from "@/components/sidebar-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts"
import { cn } from "@/lib/utils"

interface DashboardLayoutClientProps {
    role: string | null | undefined
    children: React.ReactNode
}

export function DashboardLayoutClient({ role, children }: DashboardLayoutClientProps) {
    const { isCollapsed } = useSidebar()

    return (
        <KeyboardShortcutsProvider role={role || 'student'}>
            <div className="flex min-h-screen flex-col md:flex-row">
                {/* Sidebar */}
                <div
                    className={cn(
                        "flex-none border-r bg-muted/40 hidden md:block transition-all duration-300 ease-in-out",
                        isCollapsed ? "w-[70px]" : "w-64"
                    )}
                >
                    <AppSidebar role={role} />
                </div>

                {/* Main Content */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {children}
                </div>
            </div>
        </KeyboardShortcutsProvider>
    )
}

