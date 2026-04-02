import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        worker: true,
        params: {
          eventsPerSecond: 10,
        },
        heartbeatIntervalMs: 30000,
        timeout: 20000,
        reconnectAfterMs: (tries: number) => {
          return Math.min(1000 + tries * 2000, 10000);
        },
      },
      global: {
        headers: {
          'X-Client-Info': 'shine-office',
        },
      },
    },
  );
};

// Lazy singleton — avoids crashing during Next.js static prerendering
// when env vars aren’t available at module-evaluation time.
let _supabase: ReturnType<typeof createClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    if (!_supabase) {
      _supabase = createClient();
    }
    return (_supabase as any)[prop];
  },
});

