import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service-role key.
 * This bypasses RLS and is safe to use in API routes only.
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl || "",
  supabaseServiceKey || "",
  {
    auth: { persistSession: false },
  }
);

/** The storage bucket name for payment screenshots */
export const SCREENSHOTS_BUCKET = "payment-screenshots";
