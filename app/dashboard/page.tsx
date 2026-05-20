import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-svh w-full flex-col items-center justify-center gap-8 p-6">
      <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          Personal finance
        </span>
        <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          Track every dollar. See where it went.
        </h1>
        <p className="text-pretty leading-relaxed text-muted-foreground">
          Log your daily spend in seconds and get a clean monthly breakdown of where your money goes.
        </p>
        <div className="mt-2 flex gap-3">
          <Button asChild>
            <Link href="/auth/sign-up">Get started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
