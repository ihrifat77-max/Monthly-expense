"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CATEGORIES } from "@/lib/categories"

export async function addExpense(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const amount = Number(formData.get("amount"))
  const category = String(formData.get("category") ?? "")
  const description = String(formData.get("description") ?? "").trim() || null
  const spent_on = String(formData.get("spent_on") ?? "")

  if (!amount || amount <= 0) return { error: "Amount must be greater than 0" }
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { error: "Invalid category" }
  }
  if (!spent_on) return { error: "Date is required" }

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    amount,
    category,
    description,
    spent_on,
  })

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { error } = await supabase.from("expenses").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
