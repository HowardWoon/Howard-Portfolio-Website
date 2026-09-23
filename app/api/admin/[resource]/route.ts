import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminUser } from '@/lib/admin-auth';
import { createRouteAuthClient, createServiceRoleClient, hasServiceRole } from '@/lib/supabase/route';
import { hasSupabaseCredentials } from '@/lib/supabase/fallback';

type AdminResource = 'experiences' | 'projects' | 'skills';

type RouteContext = {
  params: Promise<{ resource: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  return mutateResource(request, context, 'POST');
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return mutateResource(request, context, 'PATCH');
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return mutateResource(request, context, 'DELETE');
}

async function mutateResource(request: NextRequest, context: RouteContext, method: 'POST' | 'PATCH' | 'DELETE') {
  const { resource } = await context.params;

  if (!isResource(resource)) {
    return NextResponse.json({ error: 'Unsupported resource' }, { status: 400 });
  }

  if (!hasSupabaseCredentials() || !hasServiceRole()) {
    return NextResponse.json({ error: 'Admin writes are temporarily unavailable.' }, { status: 503 });
  }

  const { data: userData } = await createRouteAuthClient(request).auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const adminClient = createServiceRoleClient();

  if (method === 'DELETE') {
    const id = String(body.id ?? '');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { error } = await adminClient.from(resource).delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else if (!hasRequiredFields(resource, body)) {
    return NextResponse.json({ error: 'Please fill in the required fields.' }, { status: 400 });
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

// The DB columns are NOT NULL, but '' passed the old checks and saved blank rows
function hasRequiredFields(resource: AdminResource, body: Record<string, unknown>) {
  const filled = (k: string) => String(body[k] ?? '').trim().length > 0;
  if (resource === 'experiences') return filled('role') && filled('company') && filled('description');
  if (resource === 'projects') return filled('title') && filled('context') && filled('description');
  return filled('name') && filled('category');
}
