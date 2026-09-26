'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Sync current Clerk user to Supabase User table
 * This should be called on first login or dashboard visit
 */
export async function syncUser() {
  try {
    const session = await auth();
    const user = await currentUser();

    if (!user) {
      return { success: false, error: 'No authenticated user' };
    }

    // Create Supabase client with Clerk token for RLS
    const token = await session.getToken({ template: 'supabase' });
    
    const supabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('clerkId', user.id)
      .single();

    if (!existingUser) {
      // Create new user
      const { error: insertError } = await supabase
        .from('User')
        .insert({
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
          role: (user.publicMetadata?.role as 'ADMIN' | 'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF') || 'WAREHOUSE_STAFF',
        });

      if (insertError) {
        console.error('Error creating user:', insertError);
        return { success: false, error: insertError.message };
      }

      return { success: true, created: true };
    }

    // Update existing user (in case name or email changed)
    const { error: updateError } = await supabase
      .from('User')
      .update({
        email: user.emailAddresses[0]?.emailAddress || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
        role: (user.publicMetadata?.role as 'ADMIN' | 'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF') || 'WAREHOUSE_STAFF',
      })
      .eq('clerkId', user.id);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, created: false };
  } catch (error) {
    console.error('Error syncing user:', error);
    return { success: false, error: 'Failed to sync user' };
  }
}

/**
 * Get current user from Supabase (with Clerk ID)
 */
export async function getCurrentUserFromDB() {
  try {
    const session = await auth();
    const user = await currentUser();

    if (!user) {
      return null;
    }

    const token = await session.getToken({ template: 'supabase' });
    
    const supabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('clerkId', user.id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user from DB:', error);
    return null;
  }
}
