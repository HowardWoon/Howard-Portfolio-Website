import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { createServiceRoleClient, hasServiceRole } from '@/lib/supabase/route';

export const dynamic = 'force-dynamic';

/*
 * Contact endpoint.
 * Fixes vs. previous version:
 *  - The HTML "sanitizer" regex /<[^>]*>?/ deleted EVERYTHING after a lone "<"
 *    ("budget <RM5k, starting …" arrived as "budget "). Messages are plain text (React escapes them
 *    in the admin inbox and the email is text/plain), so nothing is stripped any more.
 *  - Validation ran BEFORE sanitising, so "<b></b>" passed as a name and was stored as "".
 *  - The insert used the anon key + a public INSERT policy, which also let anyone spam the table
 *    directly through Supabase's REST API, bypassing this route. It now uses the service role and
 *    the public policy is removed in sql/001_init.sql.
 *  - Honeypot field + minimum fill time silently drop most bots.
 *  - Uses the `zod` dependency that was installed but unused.
 */

const ContactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  email: z.string().trim().toLowerCase().email('Invalid email address format.').max(200),
  subject: z.string().trim().max(200).optional().default(''),
  message: z.string().trim().min(1, 'Message is required.').max(5000),
  hw_hp_field: z.string().optional().default(''), // honeypot — humans never see this field
  fillMs: z.number({ required_error: 'Please reload the page and try again.' }).int().nonnegative().max(86_400_000),
});

// Strip control characters (keeps newlines/tabs) — prevents header tricks in the email subject
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
const oneLine = (s: string) => clean(s).replace(/[\r\n]+/g, ' ');

// Best-effort, per-instance rate limit (serverless instances don't share memory; the honeypot
// and Supabase are the real spam controls).
const ipRequestMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting (Vercel sets x-real-ip; x-forwarded-for's first hop is client-controlled)
    const ip =
      request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
    const now = Date.now();
    const entry = ipRequestMap.get(ip);
    if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW_MS) {
      ipRequestMap.set(ip, { count: 1, lastReset: now });
    } else if (++entry.count > RATE_LIMIT) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }
    if (ipRequestMap.size > 5000) {
      for (const [k, v] of ipRequestMap) if (now - v.lastReset > RATE_LIMIT_WINDOW_MS) ipRequestMap.delete(k);
    }

    // 2. Same-origin check (exact host match)
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host) {
      let originHost = '';
      try {
        originHost = new URL(origin).host;
      } catch {
        /* invalid origin */
      }
      if (originHost !== host) {
        return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
      }
    }

    // 3. Validate
    const parsed = ContactSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const status = first?.code === 'too_big' ? 413 : 400;
      return NextResponse.json({ error: first?.message ?? 'Invalid payload.' }, { status });
    }
    const { name, email, subject, message, hw_hp_field, fillMs } = parsed.data;

    // 4. Bot traps — pretend success so bots don't retry
    if (hw_hp_field || fillMs < 3000) {
      return NextResponse.json({ success: true, message: 'Message sent successfully.' }, { status: 200 });
    }

    const row = {
      name: oneLine(name),
      email,
      subject: oneLine(subject || 'General Inquiry'),
      message: clean(message),
    };

    // 5. Store (service role, server-only)
    let delivered = false;
    if (hasServiceRole()) {
      const { error: dbError } = await createServiceRoleClient().from('contact_messages').insert(row);
      if (dbError) console.error('[Contact] Supabase insert failed:', dbError.message);
      else delivered = true;
    }

    // 6. Email notification
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.CONTACT_INBOX || process.env.EMAIL_USER,
          replyTo: row.email,
          subject: `[Portfolio] New Message from ${row.name}: ${row.subject}`,
          text: `You have received a new message from your portfolio contact form.\n\nName: ${row.name}\nEmail: ${row.email}\nSubject: ${row.subject}\n\nMessage:\n${row.message}\n\n---\nTo reply, simply hit "Reply" in your email client.`,
        });
        delivered = true;
      } catch (mailErr) {
        // Previously a Gmail failure threw → 500 even when the message WAS saved to Supabase
        console.error('[Contact] Email send failed:', mailErr);
      }
    }

    if (!delivered) {
      return NextResponse.json({ error: 'Message could not be delivered.' }, { status: 503 });
    }
    return NextResponse.json({ success: true, message: 'Message sent successfully.' }, { status: 200 });
  } catch (err) {
    console.error('[Contact Handler Error]:', err);
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}
