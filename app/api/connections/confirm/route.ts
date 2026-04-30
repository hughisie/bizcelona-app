import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.bizcelona.com';

// CONFIRM_HMAC_SECRET must match the value set in the Vercel dashboard.
// See app/api/cron/connection-reminders/route.ts for where tokens are generated.
const hmacSecret = process.env.CONFIRM_HMAC_SECRET ?? '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') ?? '';
  const replyParam = searchParams.get('reply') ?? '';
  const token = searchParams.get('token') ?? '';

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const replyValue = replyParam === 'true' ? true : replyParam === 'false' ? false : null;
  if (replyValue === null) {
    return NextResponse.json({ error: 'reply must be "true" or "false"' }, { status: 400 });
  }

  // Verify HMAC token to prevent arbitrary UUID-based writes
  const expected = crypto.createHmac('sha256', hmacSecret).update(`${id}:${replyParam}`).digest('hex');
  if (!token || token.length !== expected.length) {
    return new Response('Invalid token', { status: 403 });
  }
  if (!crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
    return new Response('Invalid token', { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('connection_requests')
    .update({
      reply_confirmed: replyValue,
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Failed to update connection_request:', error);
    return NextResponse.json({ error: 'Failed to record response' }, { status: 500 });
  }

  // Redirect to confirmation page
  const dest = `${APP_URL}/connections/confirmed?reply=${replyParam}`;
  return NextResponse.redirect(dest);
}
