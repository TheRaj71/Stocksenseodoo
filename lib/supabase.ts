import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

/**
 * Create a Supabase client with Clerk authentication
 * Use this in Client Components
 */
export function createClerkSupabaseClient() {
  const { getToken } = useAuth();
  
  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        fetch: async (url, options = {}) => {
          let clerkToken: string | null = null;
          try {
            clerkToken = await getToken({ template: 'supabase' });
          } catch (e) {
            // Template might not be created in Clerk dashboard
          }

          const headers = new Headers(options?.headers);
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`);
          }

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
 * Uses Clerk's auth() to get the session token if available, or service role key
 */
export async function createClerkSupabaseClientSsr() {
  let token: string | null = null;

  try {
    const session = await auth();
    token = await session.getToken({
      template: 'supabase',
    });
  } catch (err) {
    // Graceful fallback if JWT template 'supabase' is not configured in Clerk dashboard
  }

  const keyToUse = supabaseServiceKey || supabaseAnonKey;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return createClient<Database>(
    supabaseUrl,
    keyToUse,
    {
      global: {
        headers,
      },
    }
  );
}
