'use client';
export function Step3Intentions({
  state, update, picked, onPick,
}: {
  state: { hopes_to_get: string; hopes_to_bring: string; contributor_interest: boolean };
  update: (p: Partial<{ hopes_to_get: string; hopes_to_bring: string; contributor_interest: boolean }>) => void;
  picked: boolean;
  onPick: (v: boolean) => void;
}) {
  const selectedClass = 'bg-navy text-white border-2 border-navy shadow-sm';
  const unselectedClass = 'bg-white text-navy border-2 border-navy/30 hover:border-navy hover:bg-beige';

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
        <p className="text-xs mt-1 flex justify-between">
          <span className={state.hopes_to_get.length < 50 ? 'text-amber-600' : 'text-green-700'}>
            {state.hopes_to_get.length < 50 ? `${50 - state.hopes_to_get.length} more characters needed` : 'Looks good'}
          </span>
          <span className="text-gray-400">{state.hopes_to_get.length} / 1000</span>
        </p>
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
        <p className="text-xs mt-1 flex justify-between">
          <span className={state.hopes_to_bring.length < 50 ? 'text-amber-600' : 'text-green-700'}>
            {state.hopes_to_bring.length < 50 ? `${50 - state.hopes_to_bring.length} more characters needed` : 'Looks good'}
          </span>
          <span className="text-gray-400">{state.hopes_to_bring.length} / 1000</span>
        </p>
      </div>
      <div>
        <div className="text-sm font-medium text-navy">We look for "contributors" — members who actively help each other. Interested?</div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className={`px-4 py-2 text-sm rounded-md ${picked && state.contributor_interest ? selectedClass : unselectedClass}`}
            onClick={() => { update({ contributor_interest: true }); onPick(true); }}
          >
            Yes
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm rounded-md ${picked && !state.contributor_interest ? selectedClass : unselectedClass}`}
            onClick={() => { update({ contributor_interest: false }); onPick(false); }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
