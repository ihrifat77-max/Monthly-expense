export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Travel",
  "Other",
] as const

export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "var(--color-chart-1)",
  Transport: "var(--color-chart-2)",
  Shopping: "var(--color-chart-3)",
  Bills: "var(--color-chart-4)",
  Entertainment: "var(--color-chart-5)",
  Health: "var(--color-chart-1)",
  Travel: "var(--color-chart-2)",
  Other: "var(--color-chart-3)",
}
