'use server';

import { createClerkSupabaseClientSsr } from '@/lib/supabase';
import { ApiResponse, Contact, ContactInsert, ContactUpdate } from '@/lib/types';

/**
 * Get all contacts with optional type filter
 */
export async function getContacts(type?: 'VENDOR' | 'CUSTOMER'): Promise<ApiResponse<Contact[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    let query = supabase
      .from('Contact')
      .select('*')
      .order('name', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contacts:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getContacts:', error);
    return { success: false, error: 'Failed to fetch contacts' };
  }
}

/**
 * Get all suppliers (VENDOR type)
 */
export async function getSuppliers(): Promise<ApiResponse<Contact[]>> {
  return getContacts('VENDOR');
}

/**
 * Get all customers (CUSTOMER type)
 */
export async function getCustomers(): Promise<ApiResponse<Contact[]>> {
  return getContacts('CUSTOMER');
}

/**
 * Get a single contact by ID
 */
export async function getContactById(contactId: string): Promise<ApiResponse<Contact>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('Contact')
      .select('*')
      .eq('id', contactId)
      .single();

    if (error) {
      console.error('Error fetching contact:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getContactById:', error);
    return { success: false, error: 'Failed to fetch contact' };
  }
}

/**
 * Create a new contact (supplier or customer)
 */
export async function createContact(
  contact: ContactInsert
): Promise<ApiResponse<Contact>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Validate contact type
    if (!['VENDOR', 'CUSTOMER'].includes(contact.type)) {
      return { success: false, error: 'Contact type must be VENDOR or CUSTOMER' };
    }

    // Validate email format if provided
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Check if contact with same email already exists
    if (contact.email) {
      const { data: existing } = await supabase
        .from('Contact')
        .select('id')
        .eq('email', contact.email)
        .single();

      if (existing) {
        return { success: false, error: 'Contact with this email already exists' };
      }
    }

    const { data, error } = await supabase
      .from('Contact')
      .insert(contact)
      .select()
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: `${contact.type === 'VENDOR' ? 'Supplier' : 'Customer'} created successfully` };
  } catch (error) {
    console.error('Unexpected error in createContact:', error);
    return { success: false, error: 'Failed to create contact' };
  }
}

/**
 * Update an existing contact
 */
export async function updateContact(
  contactId: string,
  updates: ContactUpdate
): Promise<ApiResponse<Contact>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Validate email format if provided
    if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Check if new email already exists (if email is being updated)
    if (updates.email) {
      const { data: existing } = await supabase
        .from('Contact')
        .select('id')
        .eq('email', updates.email)
        .neq('id', contactId)
        .single();

      if (existing) {
        return { success: false, error: 'Contact with this email already exists' };
      }
    }

    const { data, error } = await supabase
      .from('Contact')
      .update(updates)
      .eq('id', contactId)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Contact updated successfully' };
  } catch (error) {
    console.error('Unexpected error in updateContact:', error);
    return { success: false, error: 'Failed to update contact' };
  }
}

/**
 * Delete a contact
 * Note: Cannot delete if contact has associated documents
 */
export async function deleteContact(contactId: string): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Check if contact has associated documents
    const { data: documents } = await supabase
      .from('StockDocument')
      .select('id')
      .eq('contactId', contactId)
      .limit(1);

    if (documents && documents.length > 0) {
      return {
        success: false,
        error: 'Cannot delete contact. There are associated receipts or deliveries.',
      };
    }

    const { error } = await supabase.from('Contact').delete().eq('id', contactId);

    if (error) {
      console.error('Error deleting contact:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Contact deleted successfully' };
  } catch (error) {
    console.error('Unexpected error in deleteContact:', error);
    return { success: false, error: 'Failed to delete contact' };
  }
}

/**
 * Search contacts by name
 */
export async function searchContacts(
  searchTerm: string,
  type?: 'VENDOR' | 'CUSTOMER'
): Promise<ApiResponse<Contact[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    let query = supabase
      .from('Contact')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('name', { ascending: true })
      .limit(20);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching contacts:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in searchContacts:', error);
    return { success: false, error: 'Failed to search contacts' };
  }
}

/**
 * Get contact statistics (number of receipts/deliveries)
 */
export async function getContactStats(contactId: string): Promise<ApiResponse<{
  totalReceipts: number;
  totalDeliveries: number;
  lastTransactionDate: string | null;
}>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Get receipts count
    const { count: receiptsCount } = await supabase
      .from('StockDocument')
      .select('*', { count: 'exact', head: true })
      .eq('contactId', contactId)
      .eq('type', 'RECEIPT');

    // Get deliveries count
    const { count: deliveriesCount } = await supabase
      .from('StockDocument')
      .select('*', { count: 'exact', head: true })
      .eq('contactId', contactId)
      .eq('type', 'DELIVERY');

    // Get last transaction date
    const { data: lastDoc } = await supabase
      .from('StockDocument')
      .select('scheduleDate')
      .eq('contactId', contactId)
      .order('scheduleDate', { ascending: false })
      .limit(1)
      .single();

    return {
      success: true,
      data: {
        totalReceipts: receiptsCount || 0,
        totalDeliveries: deliveriesCount || 0,
        lastTransactionDate: lastDoc?.scheduleDate || null,
      },
    };
  } catch (error) {
    console.error('Unexpected error in getContactStats:', error);
    return { success: false, error: 'Failed to fetch contact statistics' };
  }
}
