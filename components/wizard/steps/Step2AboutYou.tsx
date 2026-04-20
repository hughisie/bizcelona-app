'use client';
import { INDUSTRIES } from '@/lib/constants/industries';

type Step2State = {
  company: string;
  business_role: string;
  industry: string;
  industry_other: string;
  headline: string;
};

export function Step2AboutYou({
  state, update,
}: {
  state: Step2State;
  update: (p: Partial<Step2State>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-navy">Company / Employer</label>
          <input
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={state.company}
            onChange={(e) => update({ company: e.target.value })}
            placeholder="Nimbus"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy">Role / Job title</label>
          <input
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={state.business_role}
            onChange={(e) => update({ business_role: e.target.value })}
            placeholder="Founder"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">Industry</label>
        <select
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
          value={state.industry}
          onChange={(e) => update({ industry: e.target.value, industry_other: e.target.value === 'Other' ? state.industry_other : '' })}
        >
          <option value="">Pick one…</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      {state.industry === 'Other' && (
        <div>
          <label className="block text-sm font-medium text-navy">Tell us your industry</label>
          <input
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={state.industry_other}
            onChange={(e) => update({ industry_other: e.target.value })}
            placeholder="e.g. Fractional horology, Urban beekeeping…"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-navy">What do you do? <span className="text-gray-500 font-normal">(one or two sentences)</span></label>
        <textarea
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.headline}
          onChange={(e) => update({ headline: e.target.value })}
          placeholder="Building a dev-tools startup in Poblenou. Ex-Typeform."
        />
      </div>
    </div>
  );
}
