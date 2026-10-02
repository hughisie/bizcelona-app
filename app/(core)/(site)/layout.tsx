import SiteShell from '@/components/site/SiteShell';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="en">{children}</SiteShell>;
}
