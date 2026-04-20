import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED = ['/dashboard', '/profile', '/admin', '/welcome'];
// /members is handled separately: /members (index) is members-only, /members/[slug] is public
const AUTH_ROUTES = ['/login'];   // NOTE: /signup intentionally NOT here — wizard must be reachable while authed
const WELCOME_EXEMPT = ['/welcome', '/api/', '/auth-confirm', '/logout'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => path.startsWith(p));

  // Not logged in + protected → /login
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', path);
    return NextResponse.redirect(url);
  }

  // /members index is members-only; /members/[slug] is public (shareable profile links)
  if (!user && path === '/members') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', '/members');
    return NextResponse.redirect(url);
  }

  // Logged in on /login → /dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Logged in + approved + onboarding not done → push to /welcome (except exempt paths)
  if (user) {
    const exempt = WELCOME_EXEMPT.some((p) => path.startsWith(p));
    if (!exempt) {
      const { data: rows } = await supabase
        .from('profiles')
        .select('onboarding_completed_at, id')
        .eq('id', user.id)
        .maybeSingle();

      if (rows && rows.onboarding_completed_at === null) {
        const { data: mem } = await supabase
          .from('members')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle();
        if (mem?.status === 'approved' && path !== '/welcome') {
          const url = request.nextUrl.clone();
          url.pathname = '/welcome';
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse;
}
