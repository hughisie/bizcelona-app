'use client';
import { useCallback, useEffect, useState } from 'react';

export function useWizardState<T extends Record<string, unknown>>(
  storageKey: string,
  initial: T
) {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<T>;
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch {}
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
  }, [storageKey, state, hydrated]);

  const update = useCallback((patch: Partial<T>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const clear = useCallback(() => {
    try { localStorage.removeItem(storageKey); } catch {}
    setState(initial);
  }, [initial, storageKey]);

  return { state, update, clear, hydrated };
}
