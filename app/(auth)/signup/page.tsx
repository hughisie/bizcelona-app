'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WizardShell } from '@/components/wizard/WizardShell';
import { useWizardState } from '@/components/wizard/useWizardState';
import { Step1Account } from '@/components/wizard/steps/Step1Account';
import { Step2AboutYou } from '@/components/wizard/steps/Step2AboutYou';
import { Step3Intentions } from '@/components/wizard/steps/Step3Intentions';
import { Step4Socials } from '@/components/wizard/steps/Step4Socials';
import { Step5Consent } from '@/components/wizard/steps/Step5Consent';
import {
  step1Schema, step2Schema, step3Schema, step4Schema, step5Schema,
} from '@/lib/validation/application';

const LABELS = ['Account', 'About you', 'Intentions', 'Socials & source', 'Consent & submit'];

type State = {
  email: string; password: string; full_name: string;
  company: string; business_role: string; industry: string; headline: string;
  hopes_to_get: string; hopes_to_bring: string; contributor_interest: boolean;
  contributor_interest_picked: boolean;
  linkedin_url: string; whatsapp_number: string; heard_from: string; additional_info: string;
  consent_guidelines: boolean; consent_privacy: boolean; consent_contact: boolean;
  consent_selective: boolean; consent_directory: boolean;
  step1Done: boolean;
};

const INITIAL: State = {
  email: '', password: '', full_name: '',
  company: '', business_role: '', industry: '', headline: '',
  hopes_to_get: '', hopes_to_bring: '', contributor_interest: false,
  contributor_interest_picked: false,
  linkedin_url: '', whatsapp_number: '', heard_from: '', additional_info: '',
  consent_guidelines: false, consent_privacy: false, consent_contact: false,
  consent_selective: false, consent_directory: false,
  step1Done: false,
};

export default function SignupWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { state, update } = useWizardState<State>('bizcelona-signup-wizard', INITIAL);

  async function next() {
    setErr(null);
    setBusy(true);
    try {
      if (step === 1) {
        const r = step1Schema.safeParse({ email: state.email, password: state.password, full_name: state.full_name });
        if (!r.success) { setErr(r.error.issues[0]?.message ?? 'Invalid input'); return; }
        if (!state.step1Done) {
          const res = await fetch('/api/signup/step1', {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email: state.email, password: state.password, full_name: state.full_name }),
          });
          const data = await res.json();
          if (!data.ok) { setErr(data.error ?? 'Could not create account'); return; }
          update({ step1Done: true });
        }
        setStep(2); return;
      }
      if (step === 2) {
        const r = step2Schema.safeParse({
          company: state.company, business_role: state.business_role,
          industry: state.industry, headline: state.headline,
        });
        if (!r.success) {
          const issue = r.error.issues[0];
          const field = issue?.path?.[0] as string | undefined;
          const fieldLabel: Record<string, string> = {
            company: 'Company',
            business_role: 'Role',
            industry: 'Industry',
            headline: 'Headline',
          };
          const label = field && fieldLabel[field];
          setErr(label ? `${label}: ${issue?.message}` : (issue?.message ?? 'Invalid input'));
          return;
        }
        setStep(3); return;
      }
      if (step === 3) {
        if (!state.contributor_interest_picked) { setErr('Please pick Yes or No'); return; }
        const r = step3Schema.safeParse({
          hopes_to_get: state.hopes_to_get, hopes_to_bring: state.hopes_to_bring,
          contributor_interest: state.contributor_interest,
        });
        if (!r.success) {
          const issue = r.error.issues[0];
          const field = issue?.path?.[0] as string | undefined;
          const fieldLabel: Record<string, string> = {
            hopes_to_get: "What you're hoping to get",
            hopes_to_bring: "What you're hoping to bring",
            contributor_interest: 'Contributor question',
          };
          const label = field && fieldLabel[field];
          setErr(label ? `${label}: ${issue?.message}` : (issue?.message ?? 'Invalid input'));
          return;
        }
        setStep(4); return;
      }
      if (step === 4) {
        const r = step4Schema.safeParse({
          linkedin_url: state.linkedin_url, whatsapp_number: state.whatsapp_number,
          heard_from: state.heard_from, additional_info: state.additional_info || undefined,
        });
        if (!r.success) {
          const issue = r.error.issues[0];
          const field = issue?.path?.[0] as string | undefined;
          const fieldLabel: Record<string, string> = {
            linkedin_url: 'LinkedIn URL',
            whatsapp_number: 'WhatsApp number',
            heard_from: 'How you heard about us',
            additional_info: 'Additional info',
          };
          const label = field && fieldLabel[field];
          setErr(label ? `${label}: ${issue?.message}` : (issue?.message ?? 'Invalid input'));
          return;
        }
        setStep(5); return;
      }
      if (step === 5) {
        const r = step5Schema.safeParse({
          consent_guidelines: state.consent_guidelines, consent_privacy: state.consent_privacy,
          consent_contact: state.consent_contact, consent_selective: state.consent_selective,
          consent_directory: state.consent_directory,
        });
        if (!r.success) { setErr('Please tick every consent item'); return; }
        const res = await fetch('/api/application/submit', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify(state),
        });
        const data = await res.json();
        if (!data.ok) { setErr(data.error ?? 'Could not submit'); return; }
        router.push('/dashboard');
      }
    } finally { setBusy(false); }
  }

  return (
    <WizardShell
      step={step} total={5} labels={LABELS}
      title={step === 1 ? 'Create your account' : step === 5 ? 'Consent & submit' : LABELS[step-1]}
      subtitle={step === 1 ? 'Welcome to Bizcelona. Takes about 5 minutes.' : undefined}
      estimatedMinutes={5}
      footer={
        <>
          <button
            type="button"
            className="px-4 py-2 text-sm text-navy border border-gray-300 rounded-md disabled:opacity-40"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || busy}
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            {err && <span className="text-sm text-red-600">{err}</span>}
            <button
              type="button"
              className="px-5 py-2 text-sm bg-saffron text-navy font-semibold rounded-md disabled:opacity-40"
              onClick={next}
              disabled={busy}
            >
              {busy ? 'Working…' : step === 5 ? 'Submit application' : 'Next'}
            </button>
          </div>
        </>
      }
    >
      {step === 1 && <Step1Account state={state} update={update} />}
      {step === 2 && <Step2AboutYou state={state} update={update} />}
      {step === 3 && <Step3Intentions state={state} update={update} picked={state.contributor_interest_picked} onPick={(v) => update({ contributor_interest: v, contributor_interest_picked: true })} />}
      {step === 4 && <Step4Socials state={state} update={update} />}
      {step === 5 && <Step5Consent state={state} update={update} />}
    </WizardShell>
  );
}
