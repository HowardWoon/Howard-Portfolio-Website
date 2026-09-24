'use server';

import { requireAdminUser } from '@/lib/admin-auth';

function validateUUID(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('Invalid message ID format');
  }
}

import { createServiceRoleClient, hasServiceRole } from '@/lib/supabase/route';
import { revalidatePath } from 'next/cache';

function getAdminSupabase() {
  if (!hasServiceRole()) throw new Error('Supabase service role is not configured.');
  return createServiceRoleClient();
}

export async function markAsRead(id: string) {
  await requireAdminUser();
  validateUUID(id);
  const supabase = getAdminSupabase();
  const { error } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/messages');
}

export async function markAsUnread(id: string) {
  await requireAdminUser();
  validateUUID(id);
  const supabase = getAdminSupabase();
  const { error } = await supabase.from('contact_messages').update({ is_read: false }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/messages');
}

export async function deleteMessage(id: string) {
  await requireAdminUser();
  validateUUID(id);
  const supabase = getAdminSupabase();
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/messages');
}
