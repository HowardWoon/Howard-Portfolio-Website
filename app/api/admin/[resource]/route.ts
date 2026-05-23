import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

type AdminResource = 'experiences' | 'projects' | 'skills';

export async function POST(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  return mutateResource(request, context, 'POST');
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  return mutateResource(request, context, 'PATCH');
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  return mutateResource(request, context, 'DELETE');
}

async function mutateResource(request: NextRequest, context: { params: Promise<{ resource: string }> }, method: 'POST' | 'PATCH' | 'DELETE') {
  const { resource } = await context.params;

  if (!isResource(resource)) {
    return NextResponse.json({ error: 'Unsupported resource' }, { status: 400 });
  }

  const authClient = createServerClient(
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

  const { data: userData } = await authClient.auth.getUser();
  if (!isAllowedAdmin(userData.user?.id, userData.user?.app_metadata?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const adminClient = createAdminClient();

  if (method === 'DELETE') {
    const id = String(body.id ?? '');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { error } = await adminClient.from(resource).delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else if (method === 'PATCH') {
    const id = String(body.id ?? '');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const payload = sanitizePayload(resource, body) as Record<string, unknown>;
    const { error } = await adminClient.from(resource).update(payload).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    const payload = sanitizePayload(resource, body) as Record<string, unknown>;
    const { error } = await adminClient.from(resource).insert(payload);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidatePath('/');
  revalidatePath('/admin/dashboard');

  return NextResponse.json({ ok: true });
}

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    { auth: { persistSession: false } }
  );
}

function isAllowedAdmin(userId?: string, role?: string) {
  return Boolean(userId && (userId === process.env.ADMIN_USER_UUID || role === 'admin'));
}

function isResource(value: string): value is AdminResource {
  return value === 'experiences' || value === 'projects' || value === 'skills';
}

function sanitizePayload(resource: AdminResource, body: Record<string, unknown>) {
  if (resource === 'experiences') {
    return {
      role: String(body.role ?? ''),
      company: String(body.company ?? ''),
      description: String(body.description ?? ''),
      start_date: (body.start_date as string | null | undefined) || null,
      end_date: (body.end_date as string | null | undefined) || null,
      is_current: Boolean(body.is_current)
    };
  }

  if (resource === 'projects') {
    return {
      title: String(body.title ?? ''),
      context: String(body.context ?? ''),
      description: String(body.description ?? ''),
      tags: Array.isArray(body.tags) ? body.tags : String(body.tags ?? '').split(',').map((tag) => tag.trim()).filter(Boolean),
      project_url: (body.project_url as string | null | undefined) || null,
      display_order: Number(body.display_order ?? 0)
    };
  }

  return {
    name: String(body.name ?? ''),
    category: String(body.category ?? '')
  };
}
