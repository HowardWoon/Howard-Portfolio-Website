import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ADMIN_USER_UUID } from '@/lib/admin-constants';

export async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect('/admin/login');
  }

  if (user.id !== ADMIN_USER_UUID && user.app_metadata?.role !== 'admin') {
    redirect('/admin/login');
  }

  return user;
}
