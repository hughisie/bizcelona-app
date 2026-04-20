'use client';
import { INDUSTRIES } from '@/lib/constants/industries';

export function DirectoryFilters({
  search, onSearch, selectedIndustries, onToggleIndustry,
  helpOffered, selectedOffered, onToggleOffered,
  helpNeeded, selectedNeeded, onToggleNeeded,
  counts,
}: {
  search: string; onSearch: (v: string) => void;
  selectedIndustries: string[]; onToggleIndustry: (i: string) => void;
  helpOffered: string[]; selectedOffered: string[]; onToggleOffered: (t: string) => void;
  helpNeeded: string[]; selectedNeeded: string[]; onToggleNeeded: (t: string) => void;
  counts: Record<string, number>;
}) {
  return (
    <aside className="space-y-5">
      <input
        type="search"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        placeholder="Search name, skill, company…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <div>
        <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Industry</div>
        <div className="mt-2 space-y-1 text-sm text-navy">
          {INDUSTRIES.map((i) => (
            <label key={i} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedIndustries.includes(i)} onChange={() => onToggleIndustry(i)} />
              <span>{i}</span>
              <span className="text-xs text-gray-400 ml-auto">{counts[i] ?? 0}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Can help with</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {helpOffered.slice(0, 20).map((t) => (
            <button key={t}
              onClick={() => onToggleOffered(t)}
              className={`px-2 py-0.5 text-[11px] rounded-full border ${selectedOffered.includes(t) ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 border-green-200 text-green-800'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Looking for help with</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {helpNeeded.slice(0, 20).map((t) => (
            <button key={t}
              onClick={() => onToggleNeeded(t)}
              className={`px-2 py-0.5 text-[11px] rounded-full border ${selectedNeeded.includes(t) ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
