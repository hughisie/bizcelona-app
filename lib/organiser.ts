import { createClient } from '@/lib/supabase/server';

/**
 * Check if the current user is an organiser
 */
export async function isUserOrganiser(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: organiser } = await supabase
    .from('organiser_roles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return !!organiser;
}

/**
 * Get the organiser_roles row for the current user, or null if not an organiser
 */
export async function getOrganiserRecord() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: organiser } = await supabase
    .from('organiser_roles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return organiser ?? null;
}
