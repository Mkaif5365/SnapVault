import { createClient } from "@supabase/supabase-js"

/** Private bucket that holds large uploads for a few seconds, until they are forwarded to Telegram. */
export const UPLOAD_BUCKET = "uploads"

/**
 * Service-role Supabase client. Server-only: it bypasses RLS, so never import
 * it from a client component. Used only to sign and read temporary uploads.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error("Server storage configuration error: SUPABASE_SERVICE_ROLE_KEY is not set")
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
