import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { name?: string; email?: string; message?: string } | null;

  if (!body?.name || !body?.email || !body?.message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    { auth: { persistSession: false } }
  );

  const { error } = await supabase.from('contact_messages').insert({
    name: body.name,
    email: body.email,
    message: body.message
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
