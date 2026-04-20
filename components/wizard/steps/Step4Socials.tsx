'use client';
export function Step4Socials({
  state, update,
}: {
  state: { linkedin_url: string; whatsapp_number: string; heard_from: string; additional_info: string };
  update: (p: Partial<{ linkedin_url: string; whatsapp_number: string; heard_from: string; additional_info: string }>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-navy">LinkedIn URL</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.linkedin_url}
          onChange={(e) => update({ linkedin_url: e.target.value })}
          placeholder="https://linkedin.com/in/…"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">WhatsApp number</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.whatsapp_number}
          onChange={(e) => update({ whatsapp_number: e.target.value })}
          placeholder="+34612345678"
        />
        <p className="text-xs text-gray-500 mt-1">Include country code, digits only.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">How did you hear about Bizcelona?</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.heard_from}
          onChange={(e) => update({ heard_from: e.target.value })}
          placeholder="Introduced by … / Found on LinkedIn / …"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">Anything else? <span className="text-gray-500 font-normal">(optional)</span></label>
        <textarea
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.additional_info}
          onChange={(e) => update({ additional_info: e.target.value })}
        />
      </div>
    </div>
  );
}
