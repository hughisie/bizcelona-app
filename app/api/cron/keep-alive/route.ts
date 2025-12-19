import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This endpoint will be called by a cron job to keep Supabase active
export async function GET() {
  try {
    const supabase = await createClient();

    // Simple query to show database activity
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Keep-alive query failed:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('Keep-alive ping successful:', new Date().toISOString());
    return NextResponse.json({
      success: true,
      message: 'Database keep-alive successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Keep-alive error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to ping database' },
      { status: 500 }
    );
  }
}
