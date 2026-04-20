'use client';
export function Step1Account({
  state, update,
}: {
  state: { email: string; password: string; full_name: string };
  update: (p: Partial<{ email: string; password: string; full_name: string }>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-navy">Full name</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.full_name}
          onChange={(e) => update({ full_name: e.target.value })}
          placeholder="Ana García"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">Email</label>
        <input
          type="email"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="you@company.com"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">Password</label>
        <input
          type="password"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.password}
          onChange={(e) => update({ password: e.target.value })}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        <p className="text-xs text-gray-500 mt-1">We'll send you a verification link in the background — keep going.</p>
      </div>
    </div>
  );
}
