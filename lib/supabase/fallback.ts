import type { SupabaseClient } from '@supabase/supabase-js';
import { fallbackExperiences, fallbackProfile, fallbackProjects, fallbackSkills } from '@/lib/site-data';

type SupabaseAuthUser = {
  id: string;
  email: string | null;
  app_metadata?: { role?: string };
};

function createResolvedResult(data: unknown): Promise<FallbackResult> {
  return Promise.resolve({ data, error: null });
}

type FallbackResult = { data: unknown; error: { message: string } | null };
/** the chainable subset of the Supabase query builder the site uses; awaiting it resolves to the fallback rows */
type FallbackQuery = PromiseLike<FallbackResult> & {
  select: () => FallbackQuery;
  order: () => FallbackQuery;
  eq: () => FallbackQuery;
  limit: () => FallbackQuery;
  maybeSingle: () => Promise<FallbackResult>;
  single: () => Promise<FallbackResult>;
  insert: () => Promise<FallbackResult>;
  update: () => Promise<FallbackResult>;
  delete: () => Promise<FallbackResult>;
  catch: (onRejected: (reason: unknown) => unknown) => Promise<unknown>;
};

function createQueryBuilder(table: string): FallbackQuery {
  const builder: FallbackQuery = {
    select: () => builder,
    order: () => builder,
    eq: () => builder,
    limit: () => builder,
    maybeSingle: () => createResolvedResult(getFallbackSingle(table)),
    single: () => createResolvedResult(getFallbackSingle(table)),
    insert: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured.' } }),
    update: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured.' } }),
    delete: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured.' } }),
    then: (onFulfilled, onRejected) => createResolvedResult(getFallbackMany(table)).then(onFulfilled, onRejected),
    catch: (onRejected: (reason: unknown) => unknown) => createResolvedResult(getFallbackMany(table)).catch(onRejected),
  };

  return builder;
}

function getFallbackSingle(table: string) {
  if (table === 'profiles') return fallbackProfile;
  return null;
}

function getFallbackMany(table: string) {
  if (table === 'experiences') return fallbackExperiences;
  if (table === 'projects') return fallbackProjects;
  if (table === 'skills') return fallbackSkills;
  return [];
}

export function createFallbackSupabaseClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null as SupabaseAuthUser | null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase is not configured.' } }),
    },
    from: (table: string) => createQueryBuilder(table),
    // Callers treat this exactly like the real client; the offline stand-in implements the subset the site uses.
  } as unknown as SupabaseClient;
}

export function hasSupabaseCredentials() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
