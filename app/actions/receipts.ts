'use server';

import { createClerkSupabaseClientSsr } from '@/lib/supabase';
import {
  ApiResponse,
  StockDocument,
  StockDocumentInsert,
  StockDocumentWithDetails,
  StockMoveLine,
  StockMoveLineInsert,
  DocumentFilters,
  Contact,
} from '@/lib/types';
import { generateReference } from '@/lib/utils';

/**
 * Get all receipts with optional filters
 */
export async function getReceipts(
  filters?: DocumentFilters
): Promise<ApiResponse<StockDocumentWithDetails[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    let query = supabase
      .from('StockDocument')
      .select(`
        *,
        Contact (*),
        destination_location:Location!StockDocument_destLocationId_fkey (
          id,
          name,
          Warehouse (name)
        ),
        lines:StockMoveLine (
          *,
          Product (
            id,
            name,
            sku,
            UnitOfMeasure (abbreviation)
          )
        )
      `)
      .eq('type', 'RECEIPT')
      .order('scheduleDate', { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.contact_id) {
      query = query.eq('contactId', filters.contact_id);
    }

    if (filters?.destination_location_id) {
      query = query.eq('destLocationId', filters.destination_location_id);
    }

    if (filters?.date_from) {
      query = query.gte('scheduleDate', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('scheduleDate', filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching receipts:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as unknown as StockDocumentWithDetails[] };
  } catch (error) {
    console.error('Unexpected error in getReceipts:', error);
    return { success: false, error: 'Failed to fetch receipts' };
  }
}

/**
 * Get a single receipt by ID
 */
export async function getReceiptById(
  receiptId: string
): Promise<ApiResponse<StockDocumentWithDetails>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('StockDocument')
      .select(`
        *,
        Contact (*),
        destination_location:Location!StockDocument_destLocationId_fkey (
          id,
          name,
          Warehouse (name)
        ),
        lines:StockMoveLine (
          *,
          Product (
            id,
            name,
            sku,
            UnitOfMeasure (abbreviation)
          ),
          destination_location:Location!StockMoveLine_destLocationId_fkey (
            id,
            name
          )
        )
      `)
      .eq('id', receiptId)
      .eq('type', 'RECEIPT')
      .single();

    if (error) {
      console.error('Error fetching receipt:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as unknown as StockDocumentWithDetails };
  } catch (error) {
    console.error('Unexpected error in getReceiptById:', error);
    return { success: false, error: 'Failed to fetch receipt' };
  }
}

/**
 * Create a new receipt document (draft)
 */
export async function createReceipt(
  receipt: Omit<StockDocumentInsert, 'type' | 'reference'>
): Promise<ApiResponse<StockDocument>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Generate reference number
    const { count } = await supabase
      .from('StockDocument')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'RECEIPT');

    const sequence = (count || 0) + 1;
    const reference = generateReference('REC', sequence);

    const receiptData: StockDocumentInsert = {
      ...receipt,
      type: 'RECEIPT',
      reference,
      status: 'DRAFT',
    };

    const { data, error } = await supabase
      .from('StockDocument')
      .insert(receiptData)
      .select()
      .single();

    if (error) {
      console.error('Error creating receipt:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Receipt created successfully' };
  } catch (error) {
    console.error('Unexpected error in createReceipt:', error);
    return { success: false, error: 'Failed to create receipt' };
  }
}

/**
 * Update a receipt document (only if status is draft)
 */
export async function updateReceipt(
  receiptId: string,
  updates: Partial<StockDocumentInsert>
): Promise<ApiResponse<StockDocument>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Check if receipt is in draft status
    const { data: existing, error: fetchError } = await supabase
      .from('StockDocument')
      .select('status')
      .eq('id', receiptId)
      .single();

    if (fetchError) {
      console.error('Error fetching receipt:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (existing.status !== 'DRAFT') {
      return { success: false, error: 'Only draft receipts can be updated' };
    }

    const { data, error } = await supabase
      .from('StockDocument')
      .update(updates)
      .eq('id', receiptId)
      .select()
      .single();

    if (error) {
      console.error('Error updating receipt:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Receipt updated successfully' };
  } catch (error) {
    console.error('Unexpected error in updateReceipt:', error);
    return { success: false, error: 'Failed to update receipt' };
  }
}

/**
 * Delete a receipt (only if status is draft)
 */
export async function deleteReceipt(receiptId: string): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Check if receipt is in draft status
    const { data: existing, error: fetchError } = await supabase
      .from('StockDocument')
      .select('status')
      .eq('id', receiptId)
      .single();

    if (fetchError) {
      console.error('Error fetching receipt:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (existing.status !== 'DRAFT') {
      return { success: false, error: 'Only draft receipts can be deleted' };
    }

    // Delete associated move lines first (CASCADE should handle this, but being explicit)
    await supabase.from('StockMoveLine').delete().eq('documentId', receiptId);

    // Delete the receipt
    const { error } = await supabase.from('StockDocument').delete().eq('id', receiptId);

    if (error) {
      console.error('Error deleting receipt:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Receipt deleted successfully' };
  } catch (error) {
    console.error('Unexpected error in deleteReceipt:', error);
    return { success: false, error: 'Failed to delete receipt' };
  }
}

/**
 * Add a product line to a receipt
 */
export async function addReceiptLine(
  receiptId: string,
  line: Omit<StockMoveLineInsert, 'documentId' | 'sourceLocationId'>
): Promise<ApiResponse<StockMoveLine>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Verify receipt exists and is in draft status
    const { data: receipt, error: receiptError } = await supabase
      .from('StockDocument')
      .select('status, destLocationId')
      .eq('id', receiptId)
      .single();

    if (receiptError) {
      console.error('Error fetching receipt:', receiptError);
      return { success: false, error: receiptError.message };
    }

    if (receipt.status !== 'DRAFT') {
      return { success: false, error: 'Can only add lines to draft receipts' };
    }

    // For receipts, destination is the receipt's destination location
    // source is null (coming from vendor)
    const lineData: StockMoveLineInsert = {
      ...line,
      documentId: receiptId,
      sourceLocationId: null, // Receipts have no source location (coming from vendor)
      destLocationId: line.destLocationId || receipt.destLocationId,
    };

    const { data, error } = await supabase
      .from('StockMoveLine')
      .insert(lineData)
      .select()
      .single();

    if (error) {
      console.error('Error adding receipt line:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Product added to receipt' };
  } catch (error) {
    console.error('Unexpected error in addReceiptLine:', error);
    return { success: false, error: 'Failed to add product to receipt' };
  }
}

/**
 * Update a receipt line
 */
export async function updateReceiptLine(
  lineId: string,
  updates: Partial<StockMoveLineInsert>
): Promise<ApiResponse<StockMoveLine>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Check if parent document is in draft status
    const { data: line, error: lineError } = await supabase
      .from('StockMoveLine')
      .select('documentId, StockDocument!inner(status)')
      .eq('id', lineId)
      .single();

    if (lineError) {
      console.error('Error fetching line:', lineError);
      return { success: false, error: lineError.message };
    }

    if ((line as any).StockDocument.status !== 'DRAFT') {
      return { success: false, error: 'Can only update lines in draft receipts' };
    }

    const { data, error } = await supabase
      .from('StockMoveLine')
      .update(updates)
      .eq('id', lineId)
      .select()
      .single();

    if (error) {
      console.error('Error updating receipt line:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Line updated successfully' };
  } catch (error) {
    console.error('Unexpected error in updateReceiptLine:', error);
    return { success: false, error: 'Failed to update line' };
  }
}

/**
 * Delete a receipt line
 */
export async function deleteReceiptLine(lineId: string): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Check if parent document is in draft status
    const { data: line, error: lineError } = await supabase
      .from('StockMoveLine')
      .select('documentId, StockDocument!inner(status)')
      .eq('id', lineId)
      .single();

    if (lineError) {
      console.error('Error fetching line:', lineError);
      return { success: false, error: lineError.message };
    }

    if ((line as any).StockDocument.status !== 'DRAFT') {
      return { success: false, error: 'Can only delete lines from draft receipts' };
    }

    const { error } = await supabase.from('StockMoveLine').delete().eq('id', lineId);

    if (error) {
      console.error('Error deleting line:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Line deleted successfully' };
  } catch (error) {
    console.error('Unexpected error in deleteReceiptLine:', error);
    return { success: false, error: 'Failed to delete line' };
  }
}

/**
 * Validate a receipt - this increases stock quantities
 * Changes status from draft -> done and creates/updates StockItem records
 */
export async function validateReceipt(
  receiptId: string
): Promise<ApiResponse<StockDocument>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Fetch receipt with lines
    const { data: receipt, error: receiptError } = await supabase
      .from('StockDocument')
      .select(`
        *,
        lines:StockMoveLine (*)
      `)
      .eq('id', receiptId)
      .single();

    if (receiptError) {
      console.error('Error fetching receipt:', receiptError);
      return { success: false, error: receiptError.message };
    }

    if (receipt.status !== 'DRAFT') {
      return { success: false, error: 'Only draft receipts can be validated' };
    }

    if (!receipt.lines || receipt.lines.length === 0) {
      return { success: false, error: 'Receipt must have at least one product line' };
    }

    // Update stock quantities for each line
    for (const line of receipt.lines) {
      const destLocationId = line.destLocationId || receipt.destLocationId;
      
      if (!destLocationId) {
        return { success: false, error: 'Destination location is required for receipt lines' };
      }

      // Get or create StockItem for this product/location
      const { data: stockItem } = await supabase
        .from('StockItem')
        .select('*')
        .eq('productId', line.productId)
        .eq('locationId', destLocationId)
        .single();

      if (stockItem) {
        // Update existing stock item
        await supabase
          .from('StockItem')
          .update({ quantity: stockItem.quantity + line.quantity })
          .eq('id', stockItem.id);
      } else {
        // Create new stock item
        await supabase.from('StockItem').insert({
          productId: line.productId,
          locationId: destLocationId,
          quantity: line.quantity,
        });
      }
    }

    // Update receipt status to done
    const { data, error } = await supabase
      .from('StockDocument')
      .update({ 
        status: 'DONE', 
        validatedAt: new Date().toISOString(),
        doneDate: new Date().toISOString()
      })
      .eq('id', receiptId)
      .select()
      .single();

    if (error) {
      console.error('Error validating receipt:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Receipt validated successfully. Stock updated.' };
  } catch (error) {
    console.error('Unexpected error in validateReceipt:', error);
    return { success: false, error: 'Failed to validate receipt' };
  }
}

/**
 * Cancel a receipt
 */
export async function cancelReceipt(
  receiptId: string
): Promise<ApiResponse<StockDocument>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('StockDocument')
      .update({ status: 'CANCELLED' })
      .eq('id', receiptId)
      .select()
      .single();

    if (error) {
      console.error('Error canceling receipt:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Receipt canceled successfully' };
  } catch (error) {
    console.error('Unexpected error in cancelReceipt:', error);
    return { success: false, error: 'Failed to cancel receipt' };
  }
}

/**
 * Get all suppliers (contacts of type VENDOR)
 */
export async function getSuppliers(): Promise<ApiResponse<Contact[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('Contact')
      .select('*')
      .eq('type', 'VENDOR')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching suppliers:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getSuppliers:', error);
    return { success: false, error: 'Failed to fetch suppliers' };
  }
}
