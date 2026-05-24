import { createBrowserClient } from '@supabase/ssr';
import { createFallbackSupabaseClient, hasSupabaseCredentials } from '@/lib/supabase/fallback';

export function createSupabaseBrowserClient() {
  if (!hasSupabaseCredentials()) {
    return createFallbackSupabaseClient();
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  );
}
