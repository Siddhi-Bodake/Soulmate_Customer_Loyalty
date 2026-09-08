import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

/**
 * Gets the signed-in staff member's profile (id, name, role).
 * Redirects to /login if there's no session — middleware already does this
 * for page navigations, but Server Actions and route handlers need their own check.
 */
export async function requireStaff(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return profile;
}

export async function requireOwner(): Promise<Profile> {
  const profile = await requireStaff();
  if (profile.role !== "owner") redirect("/dashboard");
  return profile;
}
