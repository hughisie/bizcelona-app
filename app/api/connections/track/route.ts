import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  // Require authentication — get initiator from session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  let body: { recipientId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { recipientId } = body;
  if (!recipientId || !UUID_RE.test(recipientId)) {
    return NextResponse.json({ error: 'recipientId must be a valid UUID' }, { status: 400 });
  }

  // Can't connect with yourself
  if (recipientId === user.id) {
    return NextResponse.json({ error: 'Cannot track connection with yourself' }, { status: 400 });
  }

  // Verify recipient exists in profiles table
  const { data: recipientProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', recipientId)
    .maybeSingle();

  if (profileError || !recipientProfile) {
    return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
  }

  // Insert using service role to bypass RLS cleanly on the server side
  const admin = createAdminClient();

  // Deduplicate: skip if this pair already connected within the last 24 hours.
  // Prevents duplicate reminder emails from repeat button clicks.
  const { data: existing } = await admin
    .from('connection_requests')
    .select('id')
    .eq('initiator_id', user.id)
    .eq('recipient_id', recipientId)
    .gte('clicked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true }); // Already tracked recently — silently no-op
  }

  const { error: insertError } = await admin
    .from('connection_requests')
    .insert({
      initiator_id: user.id,
      recipient_id: recipientId,
    });

  if (insertError) {
    console.error('Failed to insert connection_request:', insertError);
    return NextResponse.json({ error: 'Failed to record connection' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
