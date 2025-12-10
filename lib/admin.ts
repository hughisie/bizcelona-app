import { createClient } from '@/lib/supabase/server';

/**
 * Check if the current user is an admin
 */
export async function isUserAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: admin } = await supabase
    .from('admins')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return !!admin;
}

/**
 * Get admin role for the current user
 */
export async function getAdminRole(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: admin } = await supabase
    .from('admins')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return admin?.role || null;
}
