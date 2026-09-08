import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Admin client using the service_role key. Bypasses Row Level Security entirely.
 *
 * Server-only, never import from a Client Component. Used exclusively for
 * privileged actions an Owner takes that regular staff RLS policies must not
 * allow — e.g. creating a new staff login.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (locally) or your Vercel project's environment variables (production)."
    );
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
