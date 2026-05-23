import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/login-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLoginPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center py-10">
      <LoginForm />
    </div>
  );
}
