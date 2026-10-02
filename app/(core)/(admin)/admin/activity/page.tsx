import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';
import { AdminNav } from '../AdminNav';

export default async function ActivityPage({
  searchParams,
}: { searchParams: Promise<{ page?: string }> }) {
  if (!(await isUserAdmin())) redirect('/dashboard');
  const supabase = await createClient();
  const { page } = await searchParams;
  const p = Math.max(1, parseInt(page ?? '1', 10) || 1);
  const pageSize = 50;

  const { data, count } = await supabase
    .from('activity_logs')
    .select('id, action, resource_type, resource_id, metadata, created_at, user_id', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((p - 1) * pageSize, p * pageSize - 1);

  // Fetch actor names separately (FK join on activity_logs.user_id → profiles.id)
  const userIds = Array.from(new Set((data ?? []).map((r: any) => r.user_id).filter(Boolean)));
  const nameById = new Map<string, string>();
  if (userIds.length) {
    const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
    (profs ?? []).forEach((p: any) => nameById.set(p.id, p.full_name ?? ''));
  }

  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <AdminNav active="activity"/>
        <h1 className="text-2xl font-bold text-navy">Activity log</h1>
        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-beige text-left">
              <tr>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">Who</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Resource</th>
                <th className="px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((row: any) => (
                <tr key={row.id} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-2 text-xs text-gray-500">{new Date(row.created_at).toLocaleString('en-GB')}</td>
                  <td className="px-4 py-2">{(row.user_id && nameById.get(row.user_id)) || row.user_id || '—'}</td>
                  <td className="px-4 py-2 font-mono text-xs">{row.action}</td>
                  <td className="px-4 py-2 text-xs">{row.resource_type} {row.resource_id && <code>{String(row.resource_id).slice(0,8)}</code>}</td>
                  <td className="px-4 py-2 text-xs text-gray-600">{row.metadata ? JSON.stringify(row.metadata) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <a href={`?page=${Math.max(1, p - 1)}`} className="text-navy underline">← Prev</a>
          <div className="text-gray-500">{((p - 1) * pageSize) + 1}–{Math.min(p * pageSize, count ?? 0)} of {count ?? 0}</div>
          <a href={`?page=${p + 1}`} className="text-navy underline">Next →</a>
        </div>
      </div>
    </div>
  );
}
