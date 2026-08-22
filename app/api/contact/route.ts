import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      // Fallback: Log message in environment without throwing unhandled crash
      console.warn('[Contact Route Fallback] Supabase not configured. Message received:', { name, email });
      return NextResponse.json(
        { success: true, message: 'Message received (Fallback mode).' },
        { status: 200 }
      );
    }

    const { error } = await supabase.from('contact_messages').insert([
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('[Supabase Error]:', error.message);
      return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Message sent successfully.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('[Contact Handler Error]:', err);
    return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 });
  }
}
