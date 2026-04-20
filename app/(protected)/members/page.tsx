import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DirectoryClient } from './DirectoryClient';
import type { DirectoryMember } from '@/components/directory/MemberRow';

export default async function DirectoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Approved + directory-visible profiles
  const { data: rows } = await supabase
    .from('profiles')
    .select(`
      id, slug, full_name, business_role, company, industry, headline,
      profile_picture_url, whatsapp_number, show_whatsapp,
      member_skills(skill_name),
      help_tags(direction, tag),
      members!inner(status)
    `)
    .eq('show_in_directory', true)
    .eq('members.status', 'approved')
    .order('full_name');

  const members: DirectoryMember[] = (rows ?? []).map((r: any) => ({
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
