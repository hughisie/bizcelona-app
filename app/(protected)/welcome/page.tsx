'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WizardShell } from '@/components/wizard/WizardShell';
import { TagInput } from '@/components/ui/TagInput';
import { HELP_TAG_SUGGESTIONS } from '@/lib/constants/help-tags';
import { welcomeStepASchema, welcomeStepBSchema } from '@/lib/validation/onboarding';

const LABELS = ['Profile polish', 'Help & privacy'];

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Step A state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // Step B state
  const [offered, setOffered] = useState<string[]>([]);
  const [needed, setNeeded] = useState<string[]>([]);
  const [showWA, setShowWA] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showDir, setShowDir] = useState(true);

  useEffect(() => {
    // Preload any existing profile data so returning users can edit.
    fetch('/api/profile/me').then(async (r) => {
      if (!r.ok) return;
      const j = await r.json();
      if (j?.profile?.profile_picture_url) setAvatarUrl(j.profile.profile_picture_url);
      if (j?.profile?.bio) setBio(j.profile.bio);
    }).catch(() => {});
  }, []);

  async function uploadAvatar(file: File) {
    const fd = new FormData(); fd.append('file', file);
    setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
      const j = await r.json();
      if (!j.ok) { setErr(j.error ?? 'Upload failed'); return; }
      setAvatarUrl(j.url);
    } finally { setBusy(false); }
  }

  async function next() {
    setErr(null);
    if (step === 1) {
      const r = welcomeStepASchema.safeParse({ profile_picture_url: avatarUrl, bio, skills });
      if (!r.success) { setErr(r.error.issues[0]?.message ?? 'Invalid input'); return; }
      setStep(2); return;
    }
    if (step === 2) {
      const r = welcomeStepBSchema.safeParse({
        help_offered: offered, help_needed: needed,
        show_whatsapp: showWA, show_email: showEmail, show_in_directory: showDir,
      });
      if (!r.success) { setErr(r.error.issues[0]?.message ?? 'Invalid input'); return; }
      setBusy(true);
      try {
        const res = await fetch('/api/onboarding/complete', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            profile_picture_url: avatarUrl, bio, skills,
            help_offered: offered, help_needed: needed,
            show_whatsapp: showWA, show_email: showEmail, show_in_directory: showDir,
          }),
        });
        const j = await res.json();
        if (!j.ok) { setErr(j.error ?? 'Could not complete'); return; }
        router.push('/dashboard');
      } finally { setBusy(false); }
    }
  }

  return (
    <WizardShell
      step={step} total={2} labels={LABELS}
      title={step === 1 ? "Welcome in. Let's polish your profile." : 'How you help — and what you need'}
      subtitle={step === 1 ? 'This is what other members will see.' : 'Help us connect you to the right people.'}
      estimatedMinutes={2}
      footer={
        <>
          <button
            type="button"
            className="px-4 py-2 text-sm text-navy border border-gray-300 rounded-md disabled:opacity-40"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || busy}
          >Back</button>
          <div className="flex items-center gap-3">
            {err && <span className="text-sm text-red-600">{err}</span>}
            <button
              type="button"
              className="px-5 py-2 text-sm bg-saffron text-navy font-semibold rounded-md disabled:opacity-40"
              onClick={next}
              disabled={busy}
            >{busy ? 'Working…' : step === 2 ? 'Finish' : 'Next'}</button>
          </div>
        </>
      }
    >
      {step === 1 && (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gradient-to-br from-saffron to-navy"/>}
            </div>
            <div>
              <label className="inline-block px-3 py-2 text-sm border border-gray-300 rounded-md cursor-pointer hover:bg-beige">
                {avatarUrl ? 'Change photo' : 'Upload photo'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">JPG/PNG/WebP up to 2MB</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy">Bio</label>
            <textarea
              rows={4} maxLength={500}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="A few sentences about your work and what you're building."
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/500</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy">Skills <span className="text-gray-500 font-normal">(3–10)</span></label>
            <TagInput value={skills} onChange={setSkills} placeholder="Product, SaaS, Fundraising…"/>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-navy">What can you help others with?</label>
            <TagInput value={offered} onChange={setOffered} suggestions={HELP_TAG_SUGGESTIONS} placeholder="e.g. Hiring first engineers"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy">What do you need help with?</label>
            <TagInput value={needed} onChange={setNeeded} suggestions={HELP_TAG_SUGGESTIONS} placeholder="e.g. B2B marketing"/>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm font-medium text-navy mb-2">Privacy</div>
            <label className="flex items-center gap-2 text-sm text-navy"><input type="checkbox" checked={showDir} onChange={(e)=>setShowDir(e.target.checked)}/> Show me in the directory</label>
            <label className="flex items-center gap-2 text-sm text-navy mt-1"><input type="checkbox" checked={showWA} onChange={(e)=>setShowWA(e.target.checked)}/> Let members message me on WhatsApp</label>
            <label className="flex items-center gap-2 text-sm text-navy mt-1"><input type="checkbox" checked={showEmail} onChange={(e)=>setShowEmail(e.target.checked)}/> Show my email to members</label>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
