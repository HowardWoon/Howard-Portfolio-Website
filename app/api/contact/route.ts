import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { hasSupabaseCredentials } from '@/lib/supabase/fallback';

const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required')
});

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null));

  const parse = ContactSchema.safeParse(body);
  if (!parse.success) {
    const issues = parse.error.format();
    return NextResponse.json({ error: 'Validation failed', issues }, { status: 400 });
  }

  if (!hasSupabaseCredentials() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Contact form is temporarily unavailable.' }, { status: 503 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    { auth: { persistSession: false } }
  );

  const { error } = await supabase.from('contact_messages').insert({
    name: parse.data.name,
    email: parse.data.email,
    message: parse.data.message
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
