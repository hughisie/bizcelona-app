import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DirectoryClient } from './DirectoryClient';
import type { DirectoryMember } from '@/components/directory/MemberRow';

export default async function DirectoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Two-query pattern to avoid the ambiguous FK (members_user_id_fkey vs members_approved_by_fkey)
  const { data: profilesData } = await supabase
    .from('profiles')
    .select(`
      id, slug, full_name, business_role, company, industry, headline,
      profile_picture_url, whatsapp_number, show_whatsapp, show_in_directory,
      member_skills(skill_name),
      help_tags(direction, tag)
    `)
    .eq('show_in_directory', true)
    .order('full_name');

  const profileIds = (profilesData ?? []).map((p) => p.id);
  const { data: membersData } = await supabase
    .from('members')
    .select('user_id, status')
    .in('user_id', profileIds.length > 0 ? profileIds : ['00000000-0000-0000-0000-000000000000']);

  const statusByUserId = new Map((membersData ?? []).map((m) => [m.user_id, m.status]));

  // Only show approved or active members who opted into the directory
  const approvedStatuses = new Set(['approved', 'active']);

  const members: DirectoryMember[] = (profilesData ?? [])
    .filter((r) => approvedStatuses.has(statusByUserId.get(r.id) ?? ''))
    .map((r: any) => ({
      id: r.id,
      slug: r.slug,
      full_name: r.full_name ?? 'Member',
      business_role: r.business_role,
      company: r.company,
      industry: r.industry,
      headline: r.headline,
      profile_picture_url: r.profile_picture_url,
      whatsapp_number: r.whatsapp_number,
      show_whatsapp: !!r.show_whatsapp,
      help_offered: (r.help_tags ?? []).filter((h: any) => h.direction === 'offered').map((h: any) => h.tag),
      help_needed: (r.help_tags ?? []).filter((h: any) => h.direction === 'needed').map((h: any) => h.tag),
    }));

  return <DirectoryClient members={members} />;
}
