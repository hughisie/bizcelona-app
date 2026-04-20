'use client';
type Consent = {
  consent_guidelines: boolean; consent_privacy: boolean; consent_contact: boolean;
  consent_selective: boolean; consent_directory: boolean;
};

const ITEMS: { key: keyof Consent; label: string }[] = [
  { key: 'consent_guidelines', label: 'I agree to follow the community guidelines.' },
  { key: 'consent_privacy', label: 'I understand this is a closed, private space and I will respect other members\' privacy.' },
  { key: 'consent_contact', label: 'I agree to be contacted by Bizcelona about my application and membership.' },
  { key: 'consent_selective', label: 'I understand that Bizcelona is selective — not every application is accepted.' },
  { key: 'consent_directory', label: 'I agree to have my name, profession and photo shown in the members database.' },
];

export function Step5Consent({
  state, update,
}: {
  state: Consent;
  update: (p: Partial<Consent>) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Please confirm the following. All five are required.</p>
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
