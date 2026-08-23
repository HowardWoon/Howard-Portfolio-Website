"use server";

import { createClient } from '@supabase/supabase-js';
import { requireAdminUser } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    { auth: { persistSession: false } }
  );
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