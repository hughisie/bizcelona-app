import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: application }, { data: member }] = await Promise.all([
    supabase.from('profiles').select('full_name, onboarding_completed_at').eq('id', user.id).maybeSingle(),
    supabase.from('applications').select('status, created_at').eq('user_id', user.id).maybeSingle(),
    supabase.from('members').select('status').eq('user_id', user.id).maybeSingle(),
  ]);

  const emailVerified = user.email_confirmed_at != null;

  // No application yet → send them to the wizard
  if (!application) redirect('/signup');

  const status = member?.status ?? application.status;
  const firstName = (profile?.full_name ?? '').split(' ')[0] || 'there';

  // Approved + onboarding done → full dashboard (this branch will grow in Phase 4)
  if (status === 'approved' && profile?.onboarding_completed_at) {
    return (
      <div className="min-h-screen bg-beige">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-navy">Welcome back, {firstName}</h1>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/members" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-saffron transition">
              <div className="text-xs uppercase tracking-wider text-gray-500">Explore</div>
              <div className="mt-1 text-lg font-semibold text-navy">Member directory</div>
              <div className="text-sm text-gray-600 mt-1">Find people to ask for help.</div>
            </Link>
            <Link href="/profile" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-saffron transition">
              <div className="text-xs uppercase tracking-wider text-gray-500">You</div>
              <div className="mt-1 text-lg font-semibold text-navy">Edit your profile</div>
              <div className="text-sm text-gray-600 mt-1">Keep your info fresh.</div>
            </Link>
            <form action="/api/auth/signout" method="post" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-xs uppercase tracking-wider text-gray-500">Session</div>
              <button className="mt-1 text-lg font-semibold text-navy underline">Sign out</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Pending / submitted
  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {!emailVerified && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-between">
            <div className="text-sm text-yellow-900">
              Your email isn&apos;t verified yet. We sent a link to <b>{user.email}</b>.
            </div>
            <form action="/api/auth/resend-verification" method="post">
              <button className="text-sm font-semibold text-yellow-900 underline">Resend</button>
            </form>
          </div>
        )}

        <h1 className="text-3xl font-bold text-navy">Thanks, {firstName} — you&apos;re in the queue.</h1>
        <p className="mt-2 text-gray-600">We typically review applications within 3–5 working days. We&apos;ll email you as soon as we&apos;ve decided.</p>

        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-xs uppercase tracking-wider text-gray-500">A peek at the community</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1,2,3].map((i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-100 bg-gray-50 select-none">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-saffron to-navy mx-auto blur-sm"></div>
                <div className="mt-3 h-3 rounded bg-gray-200 animate-pulse"></div>
                <div className="mt-2 h-2 rounded bg-gray-200 animate-pulse w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">You&apos;ll be able to see full profiles once you&apos;re approved.</p>
        </div>

        <form action="/api/auth/signout" method="post" className="mt-8 text-center">
          <button className="text-sm text-gray-500 underline">Sign out</button>
        </form>
      </div>
    </div>
  );
}
