'use client';
import React from 'react';

type Consent = {
  consent_guidelines: boolean; consent_privacy: boolean; consent_contact: boolean;
  consent_selective: boolean; consent_directory: boolean;
};

const ITEMS: { key: keyof Consent; label: React.ReactNode }[] = [
  {
    key: 'consent_guidelines',
    label: (
      <>I agree to follow the <a href="https://www.bizcelona.com/guidelines" target="_blank" rel="noopener noreferrer" className="underline text-navy">community guidelines</a>.</>
    ),
  },
  { key: 'consent_privacy', label: "I understand this is a closed, private space and I will respect other members' privacy." },
  { key: 'consent_contact', label: 'I agree to be contacted by Bizcelona about my application and membership.' },
  { key: 'consent_selective', label: 'I understand that Bizcelona is selective — not every application is accepted.' },
  { key: 'consent_directory', label: 'I agree to have my name, profession and photo shown in the members database.' },
];

const ALL_KEYS: (keyof Consent)[] = ['consent_guidelines', 'consent_privacy', 'consent_contact', 'consent_selective', 'consent_directory'];

export function Step5Consent({
  state, update,
}: {
  state: Consent;
  update: (p: Partial<Consent>) => void;
}) {
  function acceptAll() {
    const all: Partial<Consent> = {};
    for (const k of ALL_KEYS) all[k] = true;
    update(all);
  }

  function clearAll() {
    const none: Partial<Consent> = {};
    for (const k of ALL_KEYS) none[k] = false;
    update(none);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Please confirm the following. All five are required.</p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={clearAll}
          className="px-3 py-1 text-xs border border-gray-300 rounded-md text-navy hover:bg-gray-100"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={acceptAll}
          className="px-3 py-1 text-xs border border-navy rounded-md bg-navy text-white hover:bg-navy/90"
        >
          Accept all
        </button>
      </div>
      {ITEMS.map((i) => (
        <label key={i.key} className="flex gap-3 items-start p-3 border border-gray-200 rounded-md hover:bg-beige cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            checked={state[i.key]}
            onChange={(e) => update({ [i.key]: e.target.checked } as Partial<Consent>)}
          />
          <span className="text-sm text-navy">{i.label}</span>
        </label>
      ))}
    </div>
  );
}
