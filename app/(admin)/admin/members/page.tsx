import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';
import { AdminNav } from '../AdminNav';

export default async function AdminMembersPage() {
  if (!(await isUserAdmin())) redirect('/dashboard');
  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('id, slug, full_name, email, company, business_role, industry, onboarding_completed_at, members!inner(status)')
    .order('full_name');

  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <AdminNav active="members"/>
        <h1 className="text-2xl font-bold text-navy">Members</h1>
        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-beige text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Company / role</th>
                <th className="px-4 py-2">Industry</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Onboarded</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((m: any) => (
                <tr key={m.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">
                    <div className="font-medium text-navy">{m.full_name ?? '—'}</div>
                    <div className="text-xs text-gray-500">{m.email}</div>
                  </td>
                  <td className="px-4 py-2">{[m.business_role, m.company].filter(Boolean).join(' at ') || '—'}</td>
                  <td className="px-4 py-2">{m.industry ?? '—'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${m.members?.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {m.members?.status ?? 'none'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{m.onboarding_completed_at ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 text-right">
                    {m.slug && <Link href={`/members/${m.slug}`} className="text-saffron text-sm underline">View</Link>}
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
