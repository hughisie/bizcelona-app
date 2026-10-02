import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isUserAdmin } from '@/lib/admin';
import { AdminNav } from '../AdminNav';

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

export default async function AdminConnectionsPage() {
  if (!(await isUserAdmin())) redirect('/dashboard');

  const admin = createAdminClient();

  // Two-query pattern — avoids FK ambiguity
  const { data: connections } = await admin
    .from('connection_requests')
    .select('id, initiator_id, recipient_id, clicked_at, reminder_sent_at, reply_confirmed')
    .order('clicked_at', { ascending: false });

  const rows = connections ?? [];

  // Gather all unique profile IDs
  const allIds = [
    ...new Set([
      ...rows.map((r) => r.initiator_id),
      ...rows.map((r) => r.recipient_id),
    ]),
  ];

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, slug, full_name')
    .in('id', allIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <AdminNav active="connections" />
        <h1 className="text-2xl font-bold text-navy">Connections</h1>
        <p className="text-sm text-gray-500 mt-1">{rows.length} connection{rows.length !== 1 ? 's' : ''} tracked</p>

        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-beige text-left">
              <tr>
                <th className="px-4 py-2">Initiator</th>
                <th className="px-4 py-2">Recipient</th>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">Reminder sent</th>
                <th className="px-4 py-2">Reply confirmed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const initiator = profileById.get(c.initiator_id);
                const recipient = profileById.get(c.recipient_id);

                const replyDisplay =
                  c.reply_confirmed === true  ? <span className="text-green-700">✓ Replied</span> :
                  c.reply_confirmed === false ? <span className="text-red-600">✗ Not yet</span> :
                                                <span className="text-gray-400">— Unknown</span>;

                return (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {initiator?.slug ? (
                        <Link href={`/members/${initiator.slug}`} className="text-navy hover:underline font-medium">
                          {initiator.full_name ?? '—'}
                        </Link>
                      ) : (
                        <span className="text-navy font-medium">{initiator?.full_name ?? '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {recipient?.slug ? (
                        <Link href={`/members/${recipient.slug}`} className="text-navy hover:underline font-medium">
                          {recipient.full_name ?? '—'}
                        </Link>
                      ) : (
                        <span className="text-navy font-medium">{recipient?.full_name ?? '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-500">{relativeDate(c.clicked_at)}</td>
                    <td className="px-4 py-2">{c.reminder_sent_at ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2">{replyDisplay}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No connections yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
