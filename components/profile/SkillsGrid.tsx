export function SkillsGrid({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {skills.map((s) => <span key={s} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-navy">{s}</span>)}
      </div>
    </div>
  );
}
