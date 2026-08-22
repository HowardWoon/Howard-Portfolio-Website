import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Redirect to the static resume PDF placed in public/resume.pdf
  const resumeUrl = new URL('/resume.pdf', request.url);
  return NextResponse.redirect(resumeUrl, 307);
}
