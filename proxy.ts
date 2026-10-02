import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - the public marketing pages (/, /es, /ca and the events page in each language). They have nothing
     *   to protect, and running the Supabase session check on them would stop Vercel serving them from its cache.
     */
    '/((?!_next/static|_next/image|favicon.ico|\\.well-known|$|(?:es|ca)$|(?:(?:es|ca)/)?events/public$|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|woff2|ico|txt|xml|webm|mp4)$).*)',
  ],
};
