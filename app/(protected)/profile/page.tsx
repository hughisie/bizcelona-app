'use client';
import { useEffect, useState } from 'react';
import { TagInput } from '@/components/ui/TagInput';
import { HELP_TAG_SUGGESTIONS } from '@/lib/constants/help-tags';
import { INDUSTRIES } from '@/lib/constants/industries';

export default function ProfileEditPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    full_name: '', company: '', business_role: '', industry: '', headline: '',
    bio: '', whatsapp_number: '', linkedin_url: '',
    profile_picture_url: '' as string | null,
    show_whatsapp: true, show_email: false, show_in_directory: true,
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [offered, setOffered] = useState<string[]>([]);
  const [needed, setNeeded] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/profile/me'); const j = await r.json();
      if (j.ok) {
        setProfile((p) => ({
          ...p,
          full_name: j.profile?.full_name ?? '',
          company: j.profile?.company ?? '',
          business_role: j.profile?.business_role ?? '',
          industry: j.profile?.industry ?? '',
          headline: j.profile?.headline ?? '',
          bio: j.profile?.bio ?? '',
          whatsapp_number: j.profile?.whatsapp_number ?? '',
          linkedin_url: j.profile?.linkedin_url ?? '',
          profile_picture_url: j.profile?.profile_picture_url ?? null,
          show_whatsapp: j.profile?.show_whatsapp ?? true,
          show_email: j.profile?.show_email ?? false,
          show_in_directory: j.profile?.show_in_directory ?? true,
        }));
        setSkills(j.skills ?? []);
        setOffered(j.help_offered ?? []);
        setNeeded(j.help_needed ?? []);
      }
      setLoading(false);
    })();
  }, []);

  async function uploadAvatar(file: File) {
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
    const j = await r.json();
    if (j.ok) setProfile((p) => ({ ...p, profile_picture_url: j.url }));
  }

  async function save() {
    setSaving(true); setMsg(null);
    const res = await fetch('/api/profile/update', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ profile, skills, help_offered: offered, help_needed: needed }),
    });
    const j = await res.json();
    setSaving(false);
    setMsg(j.ok ? 'Saved.' : (j.error ?? 'Error saving'));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-off-white py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-navy">Your profile</h1>
        <p className="text-sm text-gray-600 mt-1">What other members see.</p>

        <div className="mt-6 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
            {profile.profile_picture_url
              ? <img src={profile.profile_picture_url} alt="" className="w-full h-full object-cover"/>
              : <div className="w-full h-full bg-gradient-to-br from-saffron to-navy"/>}
          </div>
          <label className="inline-block px-3 py-2 text-sm border border-gray-300 rounded-md cursor-pointer hover:bg-beige">
            Change photo
            <input type="file" className="hidden" accept="image/png,image/jpeg,image/webp"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Field label="Full name" value={profile.full_name} set={(v) => setProfile({ ...profile, full_name: v })}/>
          <Field label="Role" value={profile.business_role} set={(v) => setProfile({ ...profile, business_role: v })}/>
          <Field label="Company" value={profile.company} set={(v) => setProfile({ ...profile, company: v })}/>
          <div>
            <label className="block text-sm font-medium text-navy">Industry</label>
            <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
              value={profile.industry} onChange={(e) => setProfile({ ...profile, industry: e.target.value })}>
              <option value="">Pick one…</option>
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-navy">Headline</label>
          <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={profile.headline} onChange={(e) => setProfile({ ...profile, headline: e.target.value })}/>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-navy">Bio</label>
          <textarea rows={4} maxLength={500} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}/>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="LinkedIn URL" value={profile.linkedin_url} set={(v) => setProfile({ ...profile, linkedin_url: v })}/>
          <Field label="WhatsApp" value={profile.whatsapp_number} set={(v) => setProfile({ ...profile, whatsapp_number: v })}/>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-navy">Skills</label>
          <TagInput value={skills} onChange={setSkills} />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-navy">Can help with</label>
          <TagInput value={offered} onChange={setOffered} suggestions={HELP_TAG_SUGGESTIONS}/>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-navy">Looking for help with</label>
          <TagInput value={needed} onChange={setNeeded} suggestions={HELP_TAG_SUGGESTIONS}/>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-navy mb-2">Privacy</div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={profile.show_in_directory} onChange={(e) => setProfile({ ...profile, show_in_directory: e.target.checked })}/> Show me in the directory</label>
          <label className="flex items-center gap-2 text-sm mt-1"><input type="checkbox" checked={profile.show_whatsapp} onChange={(e) => setProfile({ ...profile, show_whatsapp: e.target.checked })}/> Let members message me on WhatsApp</label>
          <label className="flex items-center gap-2 text-sm mt-1"><input type="checkbox" checked={profile.show_email} onChange={(e) => setProfile({ ...profile, show_email: e.target.checked })}/> Show my email to members</label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button type="button" disabled={saving}
            onClick={save}
            className="px-5 py-2 bg-saffron text-navy font-semibold rounded-md disabled:opacity-40">
            {saving ? 'Saving…' : 'Save'}
          </button>
          {msg && <span className="text-sm text-gray-600">{msg}</span>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, set }: { label: string; value: string; set: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy">{label}</label>
      <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        value={value} onChange={(e) => set(e.target.value)} />
    </div>
  );
}
