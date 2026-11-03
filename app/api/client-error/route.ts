import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/*
 * R86: crash sink for the error boundaries (components/section-boundary.tsx, app/error.tsx, app/global-error.tsx).
 * The owner's "Something broke on this page." happened in his own browser only and its cause was lost in that
 * browser's console; now every boundary that catches sends the message here and it lands in the Vercel function logs.
 * Nothing is stored, nothing is echoed back, and only these short text fields are kept (no cookies, no body text).
 */
const MAX_BYTES = 8 * 1024;
const cut = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : undefined);

export async function POST(req: NextRequest) {
  try {
    if (Number(req.headers.get('content-length') ?? '0') > MAX_BYTES) return new NextResponse(null, { status: 204 });
    const raw = await req.text();
    if (raw.length > 0 && raw.length <= MAX_BYTES) {
      const r = JSON.parse(raw) as Record<string, unknown>;
      console.error('[client error]', {
        where: cut(r.where, 60),
        message: cut(r.message, 300),
        stack: cut(r.stack, 1500),
        digest: cut(r.digest, 60),
        page: cut(r.page, 200),
        ua: cut(req.headers.get('user-agent'), 200),
      });
    }
  } catch {
    // malformed report: ignore
  }
  return new NextResponse(null, { status: 204 });
}
