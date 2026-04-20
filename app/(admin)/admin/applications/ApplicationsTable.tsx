'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

export type ApplicationRow = {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  job_title: string | null;
  employer_business: string | null;
  status: string | null;
  created_at: string;
  // slug from joined profiles query
  slug?: string | null;
};

const statusStyle: Record<string, string> = {
  submitted:    'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved:     'bg-green-100 text-green-800',
  rejected:     'bg-red-100 text-red-800',
};

export function ApplicationsTable({ initialRows }: { initialRows: ApplicationRow[] }) {
  const [rows, setRows] = useState<ApplicationRow[]>(initialRows);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const allIds = rows.map((r) => r.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const bulkAction = useCallback(async (action: 'approve' | 'reject') => {
    if (selected.size === 0) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/applications/bulk', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), action }),
      });
      const json = await res.json();
      if (json.ok) {
        const verb = action === 'approve' ? 'Approved' : 'Rejected';
        setMessage(`${verb} ${json.succeeded} of ${json.total}`);
        // Update statuses in local state
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        setRows((prev) =>
          prev.map((r) => (selected.has(r.id) ? { ...r, status: newStatus } : r))
        );
        setSelected(new Set());
      } else {
        setMessage(`Error: ${json.error ?? 'unknown'}`);
      }
    } catch {
      setMessage('Request failed');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 4000);
    }
  }, [selected]);

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-gray-300"
                  aria-label="Select all"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((application) => (
              <tr key={application.id} className={`hover:bg-gray-50 ${selected.has(application.id) ? 'bg-saffron/5' : ''}`}>
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selected.has(application.id)}
                    onChange={() => toggleOne(application.id)}
                    className="rounded border-gray-300"
                    aria-label={`Select ${application.full_name}`}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {application.slug ? (
                    <Link href={`/members/${application.slug}`} className="text-sm font-medium text-navy hover:underline">
                      {application.full_name}
                    </Link>
                  ) : (
                    <div className="text-sm font-medium text-gray-900">{application.full_name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{application.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{application.job_title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{application.employer_business}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyle[application.status ?? ''] ?? 'bg-gray-100 text-gray-800'}`}>
                    {application.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(application.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/admin/applications/${application.id}`} className="text-saffron hover:text-orange-600 font-semibold">
                    Review →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating action bar — shown when ≥1 row selected */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-navy text-white px-5 py-3 rounded-xl shadow-2xl">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button
            onClick={() => bulkAction('approve')}
            disabled={loading}
            className="px-4 py-1.5 bg-green-500 hover:bg-green-400 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition"
          >
            Approve {selected.size}
          </button>
          <button
            onClick={() => bulkAction('reject')}
            disabled={loading}
            className="px-4 py-1.5 bg-red-500 hover:bg-red-400 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition"
          >
            Reject {selected.size}
          </button>
          {message && <span className="text-xs text-gray-300">{message}</span>}
        </div>
      )}
    </div>
  );
}
