'use client';

import { useState } from 'react';

interface Props {
  userId: string;
  isOrganiser: boolean;
}

export function OrganiserToggle({ userId, isOrganiser: initialValue }: Props) {
  const [isOrganiser, setIsOrganiser] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      if (isOrganiser) {
        const res = await fetch(`/api/admin/organiser-roles/${userId}`, { method: 'DELETE' });
        if (res.ok) setIsOrganiser(false);
      } else {
        const res = await fetch('/api/admin/organiser-roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        if (res.ok) setIsOrganiser(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isOrganiser ? 'Revoke organiser role' : 'Grant organiser role'}
      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
        isOrganiser
          ? 'bg-saffron/20 text-amber-800 hover:bg-red-100 hover:text-red-700'
          : 'bg-gray-100 text-gray-500 hover:bg-saffron/20 hover:text-amber-800'
      } disabled:opacity-50`}
    >
      {loading ? '…' : isOrganiser ? 'Organiser' : '—'}
    </button>
  );
}
