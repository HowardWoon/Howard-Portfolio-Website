import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createFallbackSupabaseClient, hasSupabaseCredentials } from '@/lib/supabase/fallback';

export async function createSupabaseServerClient() {
  if (!hasSupabaseCredentials()) {
    return createFallbackSupabaseClient();
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Component cookie writes are not always available.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Server Component cookie writes are not always available.
          }
        }
      }
    }
  );
}
