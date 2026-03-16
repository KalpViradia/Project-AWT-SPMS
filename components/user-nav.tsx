import { auth, signOut } from "@/auth"
import { UserNavClient } from "./user-nav-client"

export async function UserNav() {
    const session = await auth()
    const user = session?.user

    // Fallback initials
    const initials = user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U"

    const handleSignOut = async () => {
        "use server"
        await signOut({ redirectTo: "/" })
    }

    return <UserNavClient user={user} initials={initials} onSignOut={handleSignOut} />
}
