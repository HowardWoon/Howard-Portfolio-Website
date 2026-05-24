import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { NextRequest as RouteRequest } from 'next/server';
import { ADMIN_USER_UUID } from '@/lib/admin-constants';

export async function GET(request: NextRequest) {
  const authClient = createAuthClient(request);

  const { data: userData } = await authClient.auth.getUser();
  if (!isAllowedAdmin(userData.user?.id, userData.user?.app_metadata?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const [{ data: experiences }, { data: projects }, { data: skills }] = await Promise.all([
    adminClient.from('experiences').select('*').order('start_date', { ascending: false }),
    adminClient.from('projects').select('*').order('display_order', { ascending: true }),
    adminClient.from('skills').select('*').order('category', { ascending: true })
  ]);

  return NextResponse.json({ experiences: experiences ?? [], projects: projects ?? [], skills: skills ?? [] });
}

function createAuthClient(request: RouteRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {},
        remove() {}
      }
    }
  );
}

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    { auth: { persistSession: false } }
  );
}

function isAllowedAdmin(userId?: string, role?: string) {
  return Boolean(userId && (userId === ADMIN_USER_UUID || role === 'admin'));
}

