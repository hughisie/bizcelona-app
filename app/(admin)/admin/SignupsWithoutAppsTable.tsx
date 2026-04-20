'use client';

import { useState } from 'react';

export type SignupRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
};

export function SignupsWithoutAppsTable({ rows }: { rows: SignupRow[] }) {
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  async function handleResend(userId: string) {
    setLoadingIds((prev) => new Set(prev).add(userId));
    try {
      await fetch(`/api/admin/remind/${userId}`, { method: 'POST' });
      setSentIds((prev) => new Set(prev).add(userId));
      // Clear "Sent!" after 2 seconds
      setTimeout(() => {
        setSentIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }, 2000);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }

  if (rows.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8 text-sm">
        All registered users have submitted applications
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((profile) => (
        <div
          key={profile.id}
          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 gap-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{profile.full_name || 'No name'}</p>
            <p className="text-xs text-gray-500">{profile.email}</p>
            <p className="text-xs text-gray-400">
              {new Date(profile.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">
              not applied
            </span>
            <button
              onClick={() => handleResend(profile.id)}
              disabled={loadingIds.has(profile.id) || sentIds.has(profile.id)}
              className="px-3 py-1 text-xs font-semibold rounded-md bg-saffron text-navy hover:bg-orange-400 disabled:opacity-60 transition whitespace-nowrap"
            >
              {sentIds.has(profile.id)
                ? 'Sent!'
                : loadingIds.has(profile.id)
                ? 'Sending…'
                : 'Resend link'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
