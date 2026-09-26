import { createClient } from '@supabase/supabase-js';
import { useAuth, useSession } from '@clerk/nextjs';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase client with Clerk authentication
 * Use this in Client Components
 */
export function createClerkSupabaseClient() {
  const { getToken } = useAuth();
  
  return createClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      global: {
        // Get the Clerk Supabase token for RLS
        fetch: async (url, options = {}) => {
          const clerkToken = await getToken({
            template: 'supabase',
          });

          // Insert the Clerk Supabase token into the headers
          const headers = new Headers(options?.headers);
          headers.set('Authorization', `Bearer ${clerkToken}`);

          // Call the default fetch
          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}

/**
 * Create a Supabase client for Server Components/Actions
 * Pass the session from useSession() hook
 */
export async function createClerkSupabaseClientSsr(session: any) {
  return createClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      global: {
        // Get the Clerk Supabase token for RLS
        fetch: async (url, options = {}) => {
          const clerkToken = await session?.getToken({
            template: 'supabase',
          });

          // Insert the Clerk Supabase token into the headers
          const headers = new Headers(options?.headers);
          headers.set('Authorization', `Bearer ${clerkToken}`);

          // Call the default fetch
          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}
