"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth";

export async function recordVisit(customerId: string, amountSpent: number) {
  const profile = await requireStaff();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("record_visit", {
    p_customer_id: customerId,
    p_amount_spent: amountSpent,
    p_staff_id: profile.id,
  });

  if (error) {
    return { error: error.message } as const;
  }

  revalidatePath("/dashboard");
  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);

  const result = data?.[0];
  return {
    pointsEarned: result?.points_earned ?? 0,
    newBalance: result?.new_balance ?? 0,
  } as const;
}
