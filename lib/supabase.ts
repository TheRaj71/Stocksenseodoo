import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
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
 * Uses Clerk's auth() to get the session automatically
 */
export async function createClerkSupabaseClientSsr() {
  const session = await auth();
  const token = await session.getToken({
    template: 'supabase',
  });
  
  return createClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}
