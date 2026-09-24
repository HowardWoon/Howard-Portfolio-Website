import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ADMIN_USER_UUID } from '@/lib/admin-constants';

type MaybeAdmin =
  { id?: string | null; email?: string | null; app_metadata?: Record<string, unknown> } | null | undefined;

/**
 * Single source of truth for "is this user the admin?".
 * Previously the dashboard page accepted ADMIN_EMAIL but the API routes did not (so the admin could
 * open the dashboard but every save returned 401), and when ADMIN_EMAIL was unset a user whose email
 * was also undefined compared `undefined === undefined` → true.
 */
export function isAdminUser(user: MaybeAdmin): boolean {
  if (!user?.id) return false;
  if (ADMIN_USER_UUID && user.id === ADMIN_USER_UUID) return true;
  if (user.app_metadata?.role === 'admin') return true; // app_metadata is only writable with the service-role key
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(adminEmail && user.email && user.email.toLowerCase() === adminEmail);
}

export async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user || !isAdminUser(user)) {
    redirect('/admin/login');
  }

  return user;
}
