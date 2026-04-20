import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileHelpCards } from '@/components/profile/ProfileHelpCards';
import { SkillsGrid } from '@/components/profile/SkillsGrid';
import { GreyedSection } from '@/components/profile/GreyedSection';

export default async function PublicProfilePage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Use the SECURITY INVOKER view for the anonymous photo lookup
  const { data: slugRow } = await supabase
    .from('public_profile_slugs')
    .select('id, slug, profile_picture_url')
    .eq('slug', slug)
    .maybeSingle();

  if (!slugRow) notFound();

  const signedIn = !!user;
  const isOwn = user?.id === slugRow.id;

  if (!signedIn) {
    // Public (signed-out) view — only photo is fully visible
    return (
      <div className="min-h-screen bg-off-white">
        <div className="max-w-3xl mx-auto py-10 px-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm relative">
            <GreyedSection
              visible={false}
              overlay={
                <Link href="/signup"
                      className="px-5 py-3 bg-saffron text-navy font-semibold rounded-md shadow-md">
                  Join Bizcelona to see this member&apos;s details
                </Link>
              }
            >
              <ProfileHero
                fullName="Bizcelona member" role="Role" company="Company" industry="Industry"
                headline="A short one-line intro goes here, so non-members see the shape without the substance."
                pictureUrl={null}
                linkedinUrl={null} whatsappNumber={null}
                showWhatsapp={false} isOwnProfile={false} signedIn={false}
              />
              <div className="p-6 space-y-5">
                <ProfileHelpCards offered={['Hidden tag', 'Hidden tag']} needed={['Hidden tag']} />
                <SkillsGrid skills={['Hidden','Hidden','Hidden']} />
              </div>
            </GreyedSection>
            {/* Photo layer that is NOT greyed, positioned over the greyed hero */}
            <div className="absolute left-6 top-[86px] w-20 h-20 rounded-full border-4 border-off-white overflow-hidden bg-gray-200 z-10">
              {slugRow.profile_picture_url
                ? <img src={slugRow.profile_picture_url} alt="" className="w-full h-full object-cover"/>
                : <div className="w-full h-full bg-gradient-to-br from-saffron to-navy"/>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signed-in full view
  const [{ data: profile }, { data: member }, { data: skills }, { data: help }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', slugRow.id).maybeSingle(),
    supabase.from('members').select('status').eq('user_id', slugRow.id).maybeSingle(),
    supabase.from('member_skills').select('skill_name').eq('user_id', slugRow.id),
    supabase.from('help_tags').select('direction, tag').eq('user_id', slugRow.id),
  ]);

  if (!profile || (member?.status !== 'approved' || !profile.show_in_directory)) {
    // Only the owner can see their own non-approved profile
    if (!isOwn) notFound();
  }

  const offered = (help ?? []).filter(h => h.direction === 'offered').map(h => h.tag);
  const needed = (help ?? []).filter(h => h.direction === 'needed').map(h => h.tag);

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <ProfileHero
            fullName={profile!.full_name ?? 'Member'}
            role={profile!.business_role}
            company={profile!.company}
            industry={profile!.industry}
            headline={profile!.headline}
            pictureUrl={profile!.profile_picture_url}
            linkedinUrl={profile!.linkedin_url}
            whatsappNumber={profile!.show_whatsapp ? profile!.whatsapp_number : null}
            showWhatsapp={!!profile!.show_whatsapp}
            isOwnProfile={isOwn}
            signedIn={true}
          />
          <div className="p-6 space-y-5">
            {profile!.bio && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">About</div>
                <p className="mt-2 text-sm text-navy whitespace-pre-wrap">{profile!.bio}</p>
              </div>
            )}
            <ProfileHelpCards offered={offered} needed={needed} />
            <SkillsGrid skills={(skills ?? []).map(s => s.skill_name)} />
          </div>
        </div>
      </div>
    </div>
  );
}
