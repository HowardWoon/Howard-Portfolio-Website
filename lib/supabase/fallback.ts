import { fallbackExperiences, fallbackProfile, fallbackProjects, fallbackSkills } from '@/lib/site-data';

type SupabaseAuthUser = {
  id: string;
  email: string | null;
  app_metadata?: { role?: string };
};

function createResolvedResult(data: unknown) {
  return Promise.resolve({ data, error: null });
}

function createQueryBuilder(table: string) {
  const builder: any = {
    select: () => builder,
    order: () => builder,
    eq: () => builder,
    limit: () => builder,
    maybeSingle: () => createResolvedResult(getFallbackSingle(table)),
    single: () => createResolvedResult(getFallbackSingle(table)),
    insert: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured.' } }),
    update: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured.' } }),
    delete: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured.' } }),
    then: (onFulfilled: (value: { data: unknown; error: null }) => unknown, onRejected?: (reason: unknown) => unknown) =>
      createResolvedResult(getFallbackMany(table)).then(onFulfilled, onRejected),
    catch: (onRejected: (reason: unknown) => unknown) => createResolvedResult(getFallbackMany(table)).catch(onRejected)
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
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase is not configured.' } })
    },
    from: (table: string) => createQueryBuilder(table)
  } as any;
}

export function hasSupabaseCredentials() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
