import { signIn, auth } from "@/lib/auth"
import { Button } from "@/components/ui/Button"
import { UserNav } from "./user-nav"

export async function SignIn() {
    const session = await auth()
    if (!session) return (
        <div>
            <form
                action={async () => {
                    "use server"
                    await signIn("discord")
                }}
            >
                <Button type="submit">
                    Login with Discord
                </Button>
            </form>
        </div>
    )

    return (
        <UserNav />
    )
}
