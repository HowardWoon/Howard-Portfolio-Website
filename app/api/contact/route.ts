import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import nodemailer from 'nodemailer';

// Simple in-memory rate limiting map for basic protection
const ipRequestMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5; // max 5 requests per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || 'unknown-ip';

    const now = Date.now();
    const ipData = ipRequestMap.get(ip) || { count: 0, lastReset: now };

    if (now - ipData.lastReset > RATE_LIMIT_WINDOW_MS) {
      ipData.count = 1;
      ipData.lastReset = now;
    } else {
      ipData.count += 1;
    }
    ipRequestMap.set(ip, ipData);

    if (ipData.count > RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // 2. CSRF / Origin Check
    const origin = headersList.get('origin');
    const host = headersList.get('host');
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json(
        { error: 'Invalid origin.' },
        { status: 403 }
      );
    }

    // 3. Parse and Validate
    const body = await request.json();
    const { name, email, subject, message } = body;

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

    // 4. Input Sanitization (Basic Regex replacement to strip script tags/HTML)
    const sanitize = (str: string) => {
      if (typeof str !== 'string') return '';
      return str.replace(/<[^>]*>?/gm, '').trim();
    };

    const cleanName = sanitize(name);
    const cleanEmail = sanitize(email).toLowerCase();
    const cleanSubject = sanitize(subject || 'General Inquiry');
    const cleanMessage = sanitize(message);

    // 5. Supabase Insertion (Keep this so they still have a database backup)
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      await supabase.from('contact_messages').insert([
        {
          name: cleanName,
          email: cleanEmail,
          subject: cleanSubject,
          message: cleanMessage,
          created_at: new Date().toISOString(),
          is_read: false
        },
      ]);
    }

    // 6. Send Email via Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to themselves
        replyTo: cleanEmail, // If they click "Reply" in Gmail, it goes to the sender
        subject: `[Portfolio] New Message from ${cleanName}: ${cleanSubject}`,
        text: `You have received a new message from your portfolio contact form.\n\nName: ${cleanName}\nEmail: ${cleanEmail}\nSubject: ${cleanSubject}\n\nMessage:\n${cleanMessage}\n\n---\nTo reply, simply hit "Reply" in your email client.`,
      };

      await transporter.sendMail(mailOptions);
    } else {
      console.warn('EMAIL_USER or EMAIL_PASS not set in environment variables. Email notification was skipped.');
    }

    return NextResponse.json(
      { success: true, message: 'Message sent successfully.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('[Contact Handler Error]:', err);
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}