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
    // R28: check the declared size before reading the body
    if (Number(req.headers.get('content-length') ?? '0') > MAX_BYTES) return new NextResponse(null, { status: 204 });
    const raw = await req.text();
    if (raw.length > 0 && raw.length <= MAX_BYTES) {
      const parsed = JSON.parse(raw) as unknown;
      // legacy report-uri: { "csp-report": {...} }; Reporting API (application/reports+json): [{ type, body }]
      const reports = Array.isArray(parsed)
        ? parsed
            .filter((x): x is { type?: string; body?: Record<string, unknown> } => typeof x === 'object' && x !== null)
            .filter((x) => x.type === 'csp-violation')
            .map((x) => x.body ?? {})
            .slice(0, 10)
        : [((parsed as { 'csp-report'?: Record<string, unknown> })['csp-report'] ?? {}) as Record<string, unknown>];
      for (const r of reports)
        console.warn('[CSP report-only]', {
          blocked: r['blocked-uri'] ?? r['blockedURL'],
          directive: r['violated-directive'] ?? r['effective-directive'] ?? r['effectiveDirective'],
          page: r['document-uri'] ?? r['documentURL'],
        });
    }
  } catch {
    // malformed report: ignore
  }
  return new NextResponse(null, { status: 204 });
}
