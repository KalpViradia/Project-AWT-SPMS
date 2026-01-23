
import Link from "next/link"
import { auth } from "@/auth"
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    BookOpen,
    FileText
} from "lucide-react"

export async function AppSidebar() {
    const session = await auth()
    const role = (session?.user as any)?.role || 'student'

    const studentLinks = [
        { href: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/student/my-group", label: "My Group", icon: Users },
        { href: "/dashboard/student/project-details", label: "Project Details", icon: BookOpen },
        { href: "/dashboard/student/schedule", label: "Schedule", icon: Calendar },
        { href: "/dashboard/student/reports", label: "Reports", icon: FileText },
        { href: "/dashboard/student/settings", label: "Settings", icon: Settings },
    ]

    const facultyLinks = [
        { href: "/dashboard/faculty", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/faculty/groups", label: "Project Groups", icon: Users },
        { href: "/dashboard/faculty/reviews", label: "Reviews", icon: BookOpen },
        { href: "/dashboard/faculty/schedule", label: "Schedule", icon: Calendar },
        { href: "/dashboard/faculty/settings", label: "Settings", icon: Settings },
    ]

    const adminLinks = [
        { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/admin/users", label: "User Management", icon: Users },
        // { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
    ]

    let links = studentLinks;
    if (role === 'faculty') links = facultyLinks;
    if (role === 'admin') links = adminLinks;

    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-6 font-semibold">
                SPMS
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    )
}
