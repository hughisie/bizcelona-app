import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.bizcelona.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') ?? '';
  const replyParam = searchParams.get('reply') ?? '';

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const replyValue = replyParam === 'true' ? true : replyParam === 'false' ? false : null;
  if (replyValue === null) {
    return NextResponse.json({ error: 'reply must be "true" or "false"' }, { status: 400 });
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
