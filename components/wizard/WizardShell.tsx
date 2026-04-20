'use client';
import { WizardProgress } from './WizardProgress';

export function WizardShell({
  step, total, labels, title, subtitle, children, footer,
}: {
  step: number; total: number; labels: string[];
  title: string; subtitle?: string;
  children: React.ReactNode; footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-off-white py-10 px-4">
      <WizardProgress step={step} total={total} labels={labels} />
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-1 text-sm">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        <div className="mt-8 flex justify-between">{footer}</div>
      </div>
    </div>
  );
}
