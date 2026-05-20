"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import { deleteExpense } from "@/app/dashboard/actions"

export type Expense = {
  id: string
  amount: number
  category: string
  description: string | null
  spent_on: string
}

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const [isPending, startTransition] = useTransition()

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm font-medium">No expenses yet</p>
        <p className="text-sm text-muted-foreground">
          Add your first expense above to start tracking.
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col divide-y rounded-lg border">
      {expenses.map((e) => (
        <li
          key={e.id}
          className="flex items-center justify-between gap-4 p-4"
        >
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                ৳{Number(e.amount).toFixed(2)}
              </span>
              <Badge variant="secondary">{e.category}</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{new Date(e.spent_on).toLocaleDateString()}</span>
              {e.description && (
                <>
                  <span aria-hidden>•</span>
                  <span className="truncate">{e.description}</span>
                </>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete expense"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await deleteExpense(e.id)
              })
            }
          >
            <Trash2 className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  )
}
