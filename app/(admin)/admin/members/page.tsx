import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';
import { AdminNav } from '../AdminNav';
import { OrganiserToggle } from './OrganiserToggle';

type MemberStatus = 'none' | 'pending' | 'approved' | 'active' | 'rejected' | 'inactive';

const statusStyle: Record<string, string> = {
  approved:  'bg-green-100 text-green-800',
  active:    'bg-emerald-100 text-emerald-800',
  pending:   'bg-yellow-100 text-yellow-800',
  rejected:  'bg-red-100 text-red-800',
  inactive:  'bg-gray-200 text-gray-600',
  none:      'bg-gray-100 text-gray-500',
};

export default async function AdminMembersPage() {
  if (!(await isUserAdmin())) redirect('/dashboard');
  const supabase = await createClient();

  // Two-query pattern to avoid the ambiguous FK (members_user_id_fkey vs members_approved_by_fkey)
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, slug, full_name, email, company, business_role, industry, onboarding_completed_at')
    .order('full_name');

  const profileIds = (profilesData ?? []).map((p) => p.id);
  const { data: membersData } = await supabase
    .from('members')
    .select('user_id, status')
    .in('user_id', profileIds);

  const statusByUserId = new Map((membersData ?? []).map((m) => [m.user_id, m.status]));

  // Fetch organiser roles — two-query pattern consistent with members fetch above
  const { data: organiserData } = await supabase
    .from('organiser_roles')
    .select('user_id')
    .in('user_id', profileIds);

  const organiserSet = new Set((organiserData ?? []).map((o) => o.user_id));

  const rows = (profilesData ?? []).map((p) => ({
    ...p,
    member_status: (statusByUserId.get(p.id) ?? 'none') as MemberStatus,
    is_organiser: organiserSet.has(p.id),
  }));

  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <AdminNav active="members" />
        <h1 className="text-2xl font-bold text-navy">Members</h1>
        <p className="text-sm text-gray-500 mt-1">{rows.length} registered users</p>
        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-beige text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Company / role</th>
                <th className="px-4 py-2">Industry</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Organiser</th>
                <th className="px-4 py-2">Onboarded</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {m.slug ? (
                      <Link href={`/members/${m.slug}`} className="font-medium text-navy hover:underline">
                        {m.full_name ?? '—'}
                      </Link>
                    ) : (
                      <span className="font-medium text-navy">{m.full_name ?? '—'}</span>
                    )}
                    <div className="text-xs text-gray-500">{m.email}</div>
                  </td>
                  <td className="px-4 py-2">{[m.business_role, m.company].filter(Boolean).join(' at ') || '—'}</td>
                  <td className="px-4 py-2">{m.industry ?? '—'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[m.member_status] ?? statusStyle.none}`}>
                      {m.member_status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <OrganiserToggle userId={m.id} isOrganiser={m.is_organiser} />
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{m.onboarding_completed_at ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 text-right">
                    {m.slug && (
                      <Link href={`/members/${m.slug}`} className="text-saffron text-sm underline">
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
