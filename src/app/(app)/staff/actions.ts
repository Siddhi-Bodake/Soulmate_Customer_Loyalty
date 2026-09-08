"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/supabase/types";

export async function createStaffAccount(formData: FormData) {
  await requireOwner();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "staff") as Role;

  if (!fullName || !email || password.length < 8) {
    return { error: "Full name, email, and an 8+ character password are required." } as const;
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });

  if (error) return { error: error.message } as const;

  revalidatePath("/staff");
  return { error: undefined } as const;
}

// A very long ban duration effectively deactivates the login forever,
// without deleting the account — their name stays attached to any
// visits/redemptions they've already recorded.
const PERMANENT_BAN = "876000h"; // 100 years

export async function setStaffActive(userId: string, active: boolean) {
  const owner = await requireOwner();

  if (userId === owner.id) {
    return { error: "You can't deactivate your own account." } as const;
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: active ? "none" : PERMANENT_BAN,
  });

  if (error) return { error: error.message } as const;

  revalidatePath("/staff");
  return { error: undefined } as const;
}

export async function deleteStaffAccount(userId: string) {
  const owner = await requireOwner();

  if (userId === owner.id) {
    return { error: "You can't delete your own account." } as const;
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) return { error: error.message } as const;

  revalidatePath("/staff");
  revalidatePath("/customers");
  return { error: undefined } as const;
}
