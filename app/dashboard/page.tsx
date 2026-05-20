import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList, type Expense } from "@/components/expense-list"
import { MonthlyChart } from "@/components/monthly-chart"
import { SignOutButton } from "@/components/sign-out-button"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const now = new Date()
  const monthLabel = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10)
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    .toISOString()
    .slice(0, 10)
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate()

  // Current month: used for chart and totals
  const { data: monthExpenses } = await supabase
    .from("expenses")
    .select("id, amount, category, description, spent_on")
    .gte("spent_on", startOfMonth)
    .lt("spent_on", startOfNextMonth)
    .order("spent_on", { ascending: false })
    .order("created_at", { ascending: false })

  // Recent expenses (last 20) for the list
  const { data: recentExpenses } = await supabase
    .from("expenses")
    .select("id, amount, category, description, spent_on")
    .order("spent_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20)

  const expenses: Expense[] = (recentExpenses ?? []).map((e) => ({
    ...e,
    amount: Number(e.amount),
  }))

  const monthTotal = (monthExpenses ?? []).reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  )

  // Build chart data: one bar per day of the month
  const dailyTotals = new Map<number, number>()
  for (let d = 1; d <= daysInMonth; d++) dailyTotals.set(d, 0)
  for (const e of monthExpenses ?? []) {
    const day = Number(e.spent_on.slice(8, 10))
    dailyTotals.set(day, (dailyTotals.get(day) ?? 0) + Number(e.amount))
  }
  const chartData = Array.from(dailyTotals.entries()).map(([day, total]) => ({
    day,
    total: Number(total.toFixed(2)),
  }))

  // Per-category totals
  const byCategory = new Map<string, number>()
  for (const e of monthExpenses ?? []) {
    byCategory.set(
      e.category,
      (byCategory.get(e.category) ?? 0) + Number(e.amount),
    )
  }
  const categoryTotals = Array.from(byCategory.entries()).sort(
    (a, b) => b[1] - a[1],
  )

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-tight">
            Spend tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {user.email}
          </p>
        </div>
        <SignOutButton />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{monthLabel}</CardTitle>
            <CardDescription>Daily spend this month</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Month total</CardTitle>
            <CardDescription>{monthLabel}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-3xl font-semibold tracking-tight">
              ${monthTotal.toFixed(2)}
            </p>
            <div className="flex flex-col gap-2">
              {categoryTotals.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No expenses yet for this month.
                </p>
              ) : (
                categoryTotals.map(([cat, total]) => {
                  const pct =
                    monthTotal > 0 ? (total / monthTotal) * 100 : 0
                  return (
                    <div key={cat} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{cat}</span>
                        <span className="text-muted-foreground">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded bg-secondary">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add expense</CardTitle>
          <CardDescription>Log what you spent today.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent expenses</CardTitle>
          <CardDescription>Your last 20 entries</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseList expenses={expenses} />
        </CardContent>
      </Card>
    </main>
  )
}
