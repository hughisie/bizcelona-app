import Link from 'next/link';

export function AdminNav({ active }: { active: 'home' | 'applications' | 'members' | 'activity' | 'whatsapp' | 'connections' }) {
  const tab = (k: string, href: string, label: string) => (
    <Link key={k} href={href}
      className={`px-3 py-2 text-sm rounded-md ${active === k ? 'bg-navy text-white' : 'text-navy hover:bg-beige'}`}>
      {label}
    </Link>
  );
  return (
    <nav className="flex gap-2 mb-6 items-center">
      {tab('home', '/admin', 'Home')}
      {tab('applications', '/admin/applications', 'Applications')}
      {tab('members', '/admin/members', 'Members')}
      {tab('activity', '/admin/activity', 'Activity')}
      {tab('whatsapp', '/admin/whatsapp-links', 'WhatsApp links')}
      {tab('connections', '/admin/connections', 'Connections')}
      <Link href="/profile" className="ml-auto text-xs text-gray-500 hover:text-navy underline">View my profile</Link>
    </nav>
  );
}
