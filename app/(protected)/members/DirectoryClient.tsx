'use client';
import { useMemo, useState } from 'react';
import { MemberRow, type DirectoryMember } from '@/components/directory/MemberRow';
import { DirectoryFilters } from '@/components/directory/DirectoryFilters';

export function DirectoryClient({ members }: { members: DirectoryMember[] }) {
  const [search, setSearch] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [offered, setOffered] = useState<string[]>([]);
  const [needed, setNeeded] = useState<string[]>([]);

  const allOffered = useMemo(() => {
    const s = new Set<string>(); members.forEach(m => m.help_offered.forEach(t => s.add(t))); return Array.from(s).sort();
  }, [members]);
  const allNeeded = useMemo(() => {
    const s = new Set<string>(); members.forEach(m => m.help_needed.forEach(t => s.add(t))); return Array.from(s).sort();
  }, [members]);

  const industryCounts = useMemo(() => {
    const c: Record<string, number> = {};
    members.forEach(m => { if (m.industry) c[m.industry] = (c[m.industry] ?? 0) + 1; });
    return c;
  }, [members]);

  const filtered = useMemo(() => members.filter((m) => {
    if (industries.length && !(m.industry && industries.includes(m.industry))) return false;
    if (offered.length && !offered.some(o => m.help_offered.includes(o))) return false;
    if (needed.length && !needed.some(n => m.help_needed.includes(n))) return false;
    if (search) {
      const s = search.toLowerCase();
      const hay = [m.full_name, m.business_role, m.company, m.headline, ...m.help_offered, ...m.help_needed]
        .filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  }), [members, industries, offered, needed, search]);

  function toggle(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);
  }

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy">Members</h1>
        <p className="text-sm text-gray-600">Find someone to ask for help.</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          <DirectoryFilters
            search={search} onSearch={setSearch}
            selectedIndustries={industries} onToggleIndustry={(i) => toggle(industries, setIndustries, i)}
            helpOffered={allOffered} selectedOffered={offered} onToggleOffered={(t) => toggle(offered, setOffered, t)}
            helpNeeded={allNeeded} selectedNeeded={needed} onToggleNeeded={(t) => toggle(needed, setNeeded, t)}
            counts={industryCounts}
          />
          <div>
            <div className="text-xs text-gray-500 mb-2">{filtered.length} of {members.length} members</div>
            <div className="space-y-2">
              {filtered.map((m) => <MemberRow key={m.id} m={m}/>)}
              {filtered.length === 0 && <div className="text-sm text-gray-500 italic p-6">No members match these filters.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
