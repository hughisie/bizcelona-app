import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Admin client using the service role key. Bypasses RLS — use only on the
 * server and only for tightly-scoped operations (e.g. creating confirmed users).
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
