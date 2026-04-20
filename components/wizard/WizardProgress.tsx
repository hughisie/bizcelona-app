import { cn } from '@/lib/cn';

export function WizardProgress({
  step, total, labels,
}: { step: number; total: number; labels: string[] }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between text-xs uppercase tracking-wider text-gray-500 mb-2">
        <span>Step {step} of {total}</span>
        <span>{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-saffron transition-all duration-300"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1 text-[10px] text-gray-500">
        {labels.map((l, i) => (
          <div
            key={l}
            className={cn(
              'truncate',
              i + 1 === step ? 'text-navy font-semibold' : '',
              i + 1 < step ? 'text-saffron' : ''
            )}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
