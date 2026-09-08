"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { SESSION_COOKIE } from "@/lib/supabase/middleware";

export async function signIn(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  const mode = String(formData.get("mode") ?? "owner");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !signInData.user) {
    return { error: "Incorrect email or password." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", signInData.user.id)
    .single();

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "No staff profile is set up for this account yet." };
  }

  // The tab picked on the login screen must match the account's real role —
  // an Owner account can't sign in through the Staff tab, and vice versa.
  if (profile.role !== mode) {
    await supabase.auth.signOut();
    const correctTab = profile.role === "owner" ? "Owner Login" : "Staff Login";
    return { error: `This is a ${profile.role} account — please use ${correctTab} instead.` };
  }

  // Marks when this login started, so middleware can force a fresh sign-in
  // after 24 hours (a free-tier substitute for Supabase's paid session cap).
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, String(Date.now()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours, in seconds
  });

  redirect(next || "/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
