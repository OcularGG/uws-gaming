import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/Button"

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <Button type="submit" variant="ghost" className="w-full justify-start p-0">
        Logout
      </Button>
    </form>
  )
}
