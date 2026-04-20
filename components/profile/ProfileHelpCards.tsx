export function ProfileHelpCards({ offered, needed }: { offered: string[]; needed: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="text-xs font-semibold text-green-700 uppercase tracking-wider">Can help with</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {offered.length === 0
            ? <span className="text-sm text-gray-500">—</span>
            : offered.map((t) => <span key={t} className="px-2 py-0.5 bg-white border border-green-200 rounded-full text-xs">{t}</span>)}
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Looking for help with</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {needed.length === 0
            ? <span className="text-sm text-gray-500">—</span>
            : needed.map((t) => <span key={t} className="px-2 py-0.5 bg-white border border-amber-200 rounded-full text-xs">{t}</span>)}
        </div>
      </div>
    </div>
  );
}
