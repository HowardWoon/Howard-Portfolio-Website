import { NextResponse, type NextRequest } from 'next/server';
import { isAdminUser } from '@/lib/admin-auth';
import { createRouteAuthClient, createServiceRoleClient, hasServiceRole } from '@/lib/supabase/route';
import { hasSupabaseCredentials } from '@/lib/supabase/fallback';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Previously crashed with a 500 ("supabaseUrl is required") when Supabase wasn't configured
  if (!hasSupabaseCredentials() || !hasServiceRole()) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  const { data: userData } = await createRouteAuthClient(request).auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createServiceRoleClient();
  const [{ data: experiences }, { data: projects }, { data: skills }] = await Promise.all([
    adminClient.from('experiences').select('*').order('start_date', { ascending: false }),
    adminClient.from('projects').select('*').order('display_order', { ascending: true }),
    adminClient.from('skills').select('*').order('category', { ascending: true })
  ]);

  return NextResponse.json({ experiences: experiences ?? [], projects: projects ?? [], skills: skills ?? [] });
}
