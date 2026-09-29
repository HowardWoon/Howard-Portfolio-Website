import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/*
 * CSP violation sink for the `Content-Security-Policy-Report-Only` header (next.config.mjs `report-uri`).
 * Without a report target the report-only policy did nothing. Reports are logged (Vercel function logs)
 * so the policy can be tightened and eventually enforced. Nothing is stored, and nothing is echoed back.
 */
const MAX_BYTES = 8 * 1024;

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    if (raw.length > 0 && raw.length <= MAX_BYTES) {
      const body = JSON.parse(raw) as { 'csp-report'?: Record<string, unknown> };
      const r = body['csp-report'] ?? {};
      console.warn('[CSP report-only]', {
        blocked: r['blocked-uri'],
        directive: r['violated-directive'] ?? r['effective-directive'],
        page: r['document-uri'],
      });
    }
  } catch {
    // malformed report: ignore
  }
  return new NextResponse(null, { status: 204 });
}
