'use server';

import { createClerkSupabaseClientSsr } from '@/lib/supabase';

/**
 * Test database connection and list products
 */
export async function testConnection() {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    
    const { data, error } = await supabase
      .from('Product')
      .select('*')
      .limit(5);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
