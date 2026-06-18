import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Build the service-role client on first use. Env is validated lazily (at
 * request time) rather than at module import — importing this file during
 * `next build` page-data collection must not throw when env is absent.
 */
function getClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!supabaseServiceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return client;
}

/**
 * Lazy proxy preserving the `supabaseServer.from(...)` call API while deferring
 * client creation (and env validation) until the first property access.
 */
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const c = getClient();
    const value = Reflect.get(c, prop, c);
    // Bind methods to the real client so internal `this` stays correct.
    return typeof value === "function" ? value.bind(c) : value;
  },
});
