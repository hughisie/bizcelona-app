import { cn } from '@/lib/cn';
export function GreyedSection({ visible, children, overlay }: {
  visible: boolean; children: React.ReactNode; overlay?: React.ReactNode;
}) {
  if (visible) return <>{children}</>;
  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm grayscale opacity-60">{children}</div>
      {overlay && <div className="absolute inset-0 flex items-center justify-center">{overlay}</div>}
    </div>
  );
}
