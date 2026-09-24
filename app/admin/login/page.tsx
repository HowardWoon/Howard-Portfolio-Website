import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/login-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLoginPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  // Only the ADMIN goes straight to the dashboard. Any other signed-in account used to be bounced
  // dashboard → login → dashboard forever (ERR_TOO_MANY_REDIRECTS) with no way to sign out.
  if (data.user && isAdminUser(data.user)) {
    redirect('/admin/messages');
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center py-10">
      <LoginForm />
    </div>
  );
}
