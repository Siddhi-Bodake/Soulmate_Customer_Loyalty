"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireStaff, requireOwner } from "@/lib/auth";

export type CustomerFormState = { error?: string } | undefined;

export async function searchCustomers(query: string) {
  await requireStaff();
  const supabase = await createClient();

  let request = supabase
    .from("customers")
    .select("id, name, phone, email, points_balance")
    .order("name")
    .limit(8);

  const q = query.trim();
  if (q) {
    request = request.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data, error } = await request;
  if (error) return [];
  return data;
}

export async function createCustomer(
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  await requireStaff();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !phone) {
    return { error: "Name and phone number are required." };
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({ name, phone, email: email || null })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A customer with this phone number already exists." };
    }
    return { error: error.message };
  }

  revalidatePath("/customers");
  redirect(`/customers/${data.id}`);
}

export async function updateCustomer(
  id: string,
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  await requireStaff();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !phone) {
    return { error: "Name and phone number are required." };
  }

  const { error } = await supabase
    .from("customers")
    .update({ name, phone, email: email || null })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A customer with this phone number already exists." };
    }
    return { error: error.message };
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function deleteCustomer(id: string) {
  await requireOwner();
  const supabase = await createClient();
  await supabase.from("customers").delete().eq("id", id);
  revalidatePath("/customers");
  redirect("/customers");
}
