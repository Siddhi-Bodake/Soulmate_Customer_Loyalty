"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff, requireOwner } from "@/lib/auth";

export async function redeemReward(customerId: string, rewardId: string) {
  const profile = await requireStaff();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("redeem_reward", {
    p_customer_id: customerId,
    p_reward_id: rewardId,
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
    pointsUsed: result?.points_used ?? 0,
    newBalance: result?.new_balance ?? 0,
  } as const;
}

export async function createReward(formData: FormData) {
  await requireOwner();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const pointsRequired = Number(formData.get("points_required"));

  if (!name || !Number.isFinite(pointsRequired) || pointsRequired <= 0) {
    return { error: "Enter a name and a valid points cost." } as const;
  }

  const { error } = await supabase
    .from("rewards")
    .insert({ name, points_required: Math.round(pointsRequired) });

  if (error) return { error: error.message } as const;

  revalidatePath("/rewards");
  return { error: undefined } as const;
}

export async function toggleReward(rewardId: string, active: boolean) {
  await requireOwner();
  const supabase = await createClient();
  await supabase.from("rewards").update({ active }).eq("id", rewardId);
  revalidatePath("/rewards");
}
