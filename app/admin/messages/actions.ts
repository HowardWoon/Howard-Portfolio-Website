'use server';

import { requireAdminUser } from '@/lib/admin-auth';
import { createServiceRoleClient, hasServiceRole } from '@/lib/supabase/route';
import { revalidatePath } from 'next/cache';

function getAdminSupabase() {
  // createClient('') threw "supabaseUrl is required" when the service key wasn't set
  if (!hasServiceRole()) throw new Error('Supabase service role is not configured.');
  return createServiceRoleClient();
}

export async function markAsRead(id: string) {
  await requireAdminUser();
  const supabase = getAdminSupabase();
  await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
  revalidatePath('/admin/messages');
}

export async function markAsUnread(id: string) {
  await requireAdminUser();
  const supabase = getAdminSupabase();
  await supabase.from('contact_messages').update({ is_read: false }).eq('id', id);
  revalidatePath('/admin/messages');
}

export async function deleteMessage(id: string) {
  await requireAdminUser();
  const supabase = getAdminSupabase();
  await supabase.from('contact_messages').delete().eq('id', id);
  revalidatePath('/admin/messages');
}
