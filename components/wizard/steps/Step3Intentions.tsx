'use client';
export function Step3Intentions({
  state, update, picked, onPick,
}: {
  state: { hopes_to_get: string; hopes_to_bring: string; contributor_interest: boolean };
  update: (p: Partial<{ hopes_to_get: string; hopes_to_bring: string; contributor_interest: boolean }>) => void;
  picked: boolean;
  onPick: (v: boolean) => void;
}) {
  const selectedClass = 'bg-navy text-white border-navy';
  const unselectedClass = 'bg-gray-100 border-gray-300 text-navy hover:bg-gray-200';

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-navy">What are you hoping to get from Bizcelona?</label>
        <textarea
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.hopes_to_get}
          onChange={(e) => update({ hopes_to_get: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">What do you hope to bring?</label>
        <p className="text-xs text-gray-500 mb-1">Bizcelona runs on a give-first model. Tell us how you'll show up for others.</p>
        <textarea
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.hopes_to_bring}
          onChange={(e) => update({ hopes_to_bring: e.target.value })}
        />
      </div>
      <div>
        <div className="text-sm font-medium text-navy">We look for "contributors" — members who actively help each other. Interested?</div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className={`px-4 py-2 text-sm rounded-md border ${picked && state.contributor_interest ? selectedClass : unselectedClass}`}
            onClick={() => { update({ contributor_interest: true }); onPick(true); }}
          >
            Yes
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm rounded-md border ${picked && !state.contributor_interest ? selectedClass : unselectedClass}`}
            onClick={() => { update({ contributor_interest: false }); onPick(false); }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
