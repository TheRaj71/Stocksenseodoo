'use server';

import { createClerkSupabaseClientSsr } from '@/lib/supabase';
import { ApiResponse, StockDocument, StockDocumentInsert, StockDocumentWithDetails, StockMoveLine, StockMoveLineInsert, DocumentFilters, Contact } from '@/lib/types';
import { generateReference } from '@/lib/utils';

export async function getDeliveries(filters?: DocumentFilters): Promise<ApiResponse<StockDocumentWithDetails[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    let query = supabase.from('StockDocument').select(`*, Contact (*), source_location:Location!StockDocument_sourceLocationId_fkey (id, name, Warehouse (name)), lines:StockMoveLine (*, Product (id, name, sku, UnitOfMeasure (abbreviation)))`).eq('type', 'DELIVERY').order('scheduleDate', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.contact_id) query = query.eq('contactId', filters.contact_id);
    if (filters?.source_location_id) query = query.eq('sourceLocationId', filters.source_location_id);
    if (filters?.date_from) query = query.gte('scheduleDate', filters.date_from);
    if (filters?.date_to) query = query.lte('scheduleDate', filters.date_to);
    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as unknown as StockDocumentWithDetails[] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch deliveries' };
  }
}

export async function getDeliveryById(deliveryId: string): Promise<ApiResponse<StockDocumentWithDetails>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data, error } = await supabase.from('StockDocument').select(`*, Contact (*), source_location:Location!StockDocument_sourceLocationId_fkey (id, name, Warehouse (name)), lines:StockMoveLine (*, Product (id, name, sku, UnitOfMeasure (abbreviation)), source_location:Location!StockMoveLine_sourceLocationId_fkey (id, name))`).eq('id', deliveryId).eq('type', 'DELIVERY').single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as unknown as StockDocumentWithDetails };
  } catch (error) {
    return { success: false, error: 'Failed to fetch delivery' };
  }
}

export async function createDelivery(delivery: Omit<StockDocumentInsert, 'type' | 'reference'>): Promise<ApiResponse<StockDocument>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { count } = await supabase.from('StockDocument').select('*', { count: 'exact', head: true }).eq('type', 'DELIVERY');
    const reference = generateReference('DEL', (count || 0) + 1);
    const { data, error } = await supabase.from('StockDocument').insert({ ...delivery, type: 'DELIVERY', reference, status: 'DRAFT' }).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data, message: 'Delivery created successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to create delivery' };
  }
}

export async function updateDelivery(deliveryId: string, updates: Partial<StockDocumentInsert>): Promise<ApiResponse<StockDocument>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data: existing } = await supabase.from('StockDocument').select('status').eq('id', deliveryId).single();
    if (existing?.status !== 'DRAFT') return { success: false, error: 'Only draft deliveries can be updated' };
    const { data, error } = await supabase.from('StockDocument').update(updates).eq('id', deliveryId).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data, message: 'Delivery updated successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to update delivery' };
  }
}

export async function deleteDelivery(deliveryId: string): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data: existing } = await supabase.from('StockDocument').select('status').eq('id', deliveryId).single();
    if (existing?.status !== 'DRAFT') return { success: false, error: 'Only draft deliveries can be deleted' };
    await supabase.from('StockMoveLine').delete().eq('documentId', deliveryId);
    const { error } = await supabase.from('StockDocument').delete().eq('id', deliveryId);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Delivery deleted successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to delete delivery' };
  }
}

export async function addDeliveryLine(deliveryId: string, line: Omit<StockMoveLineInsert, 'documentId' | 'destLocationId'>): Promise<ApiResponse<StockMoveLine>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data: delivery } = await supabase.from('StockDocument').select('status, sourceLocationId').eq('id', deliveryId).single();
    if (delivery?.status !== 'DRAFT') return { success: false, error: 'Can only add lines to draft deliveries' };
    const sourceLocationId = line.sourceLocationId || delivery.sourceLocationId;
    if (!sourceLocationId) return { success: false, error: 'Source location is required' };
    const { data: stockItem } = await supabase.from('StockItem').select('quantity').eq('productId', line.productId).eq('locationId', sourceLocationId).single();
    if (!stockItem || stockItem.quantity < line.quantity) return { success: false, error: `Insufficient stock. Available: ${stockItem?.quantity || 0}, Requested: ${line.quantity}` };
    const { data, error } = await supabase.from('StockMoveLine').insert({ ...line, documentId: deliveryId, sourceLocationId, destLocationId: null }).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data, message: 'Product added to delivery' };
  } catch (error) {
    return { success: false, error: 'Failed to add product to delivery' };
  }
}

export async function updateDeliveryLine(lineId: string, updates: Partial<StockMoveLineInsert>): Promise<ApiResponse<StockMoveLine>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data: line } = await supabase.from('StockMoveLine').select('documentId, productId, sourceLocationId, quantity, StockDocument!inner(status)').eq('id', lineId).single();
    if ((line as any)?.StockDocument?.status !== 'DRAFT') return { success: false, error: 'Can only update lines in draft deliveries' };
    if (updates.quantity && updates.quantity > (line?.quantity || 0)) {
      const productId = line?.productId;
      const sourceLocationId = line?.sourceLocationId;
      if (!productId || !sourceLocationId) return { success: false, error: 'Invalid line data' };
      const { data: stockItem } = await supabase.from('StockItem').select('quantity').eq('productId', productId).eq('locationId', sourceLocationId).single();
      if (!stockItem || stockItem.quantity < updates.quantity) return { success: false, error: `Insufficient stock. Available: ${stockItem?.quantity || 0}` };
    }
    const { data, error } = await supabase.from('StockMoveLine').update(updates).eq('id', lineId).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data, message: 'Line updated successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to update line' };
  }
}

export async function deleteDeliveryLine(lineId: string): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data: line } = await supabase.from('StockMoveLine').select('StockDocument!inner(status)').eq('id', lineId).single();
    if ((line as any)?.StockDocument?.status !== 'DRAFT') return { success: false, error: 'Can only delete lines from draft deliveries' };
    const { error } = await supabase.from('StockMoveLine').delete().eq('id', lineId);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Line deleted successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to delete line' };
  }
}

export async function validateDelivery(deliveryId: string): Promise<ApiResponse<StockDocument>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data: delivery } = await supabase.from('StockDocument').select(`*, lines:StockMoveLine (*)`).eq('id', deliveryId).single();
    if (delivery?.status !== 'DRAFT') return { success: false, error: 'Only draft deliveries can be validated' };
    if (!delivery?.lines || delivery.lines.length === 0) return { success: false, error: 'Delivery must have at least one product line' };
    for (const line of delivery.lines) {
      const sourceLocationId = line.sourceLocationId || delivery.sourceLocationId;
      if (!sourceLocationId) return { success: false, error: 'Source location is required' };
      const { data: stockItem } = await supabase.from('StockItem').select('*').eq('productId', line.productId).eq('locationId', sourceLocationId).single();
      if (!stockItem || stockItem.quantity < line.quantity) return { success: false, error: `Insufficient stock. Available: ${stockItem?.quantity || 0}, Required: ${line.quantity}` };
      await supabase.from('StockItem').update({ quantity: stockItem.quantity - line.quantity }).eq('id', stockItem.id);
    }
    const { data, error } = await supabase.from('StockDocument').update({ status: 'DONE', validatedAt: new Date().toISOString(), doneDate: new Date().toISOString() }).eq('id', deliveryId).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data, message: 'Delivery validated successfully. Stock updated.' };
  } catch (error) {
    return { success: false, error: 'Failed to validate delivery' };
  }
}

export async function cancelDelivery(deliveryId: string): Promise<ApiResponse<StockDocument>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data, error } = await supabase.from('StockDocument').update({ status: 'CANCELLED' }).eq('id', deliveryId).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data, message: 'Delivery canceled successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to cancel delivery' };
  }
}

export async function getCustomers(): Promise<ApiResponse<Contact[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data, error } = await supabase.from('Contact').select('*').eq('type', 'CUSTOMER').order('name', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch customers' };
  }
}

/**
 * Set delivery to WAITING status (ready for picking)
 * Transition: DRAFT → WAITING
 */
export async function setDeliveryToWaiting(deliveryId: string): Promise<ApiResponse<StockDocument>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data: delivery } = await supabase.from('StockDocument').select('status, lines:StockMoveLine(*)').eq('id', deliveryId).single();
    if (!delivery) return { success: false, error: 'Delivery not found' };
    if (delivery.status !== 'DRAFT') return { success: false, error: 'Only draft deliveries can be set to waiting' };
    if (!delivery.lines || delivery.lines.length === 0) return { success: false, error: 'Delivery must have at least one product line' };
    const { data, error } = await supabase.from('StockDocument').update({ status: 'WAITING' }).eq('id', deliveryId).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data, message: 'Delivery set to WAITING status. Ready for picking.' };
  } catch (error) {
    return { success: false, error: 'Failed to set delivery to waiting' };
  }
}

/**
 * Set delivery to READY status (picked and ready for packing/shipping)
 * Transition: WAITING → READY
 */
export async function setDeliveryToReady(deliveryId: string): Promise<ApiResponse<StockDocument>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data: delivery } = await supabase.from('StockDocument').select('status').eq('id', deliveryId).single();
    if (!delivery) return { success: false, error: 'Delivery not found' };
    if (delivery.status !== 'WAITING') return { success: false, error: 'Only waiting deliveries can be set to ready' };
    const { data, error } = await supabase.from('StockDocument').update({ status: 'READY' }).eq('id', deliveryId).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data, message: 'Delivery set to READY status. Picked and ready for packing.' };
  } catch (error) {
    return { success: false, error: 'Failed to set delivery to ready' };
  }
}

/**
 * Get deliveries by status for pick/pack workflows
 */
export async function getDeliveriesByStatus(status: 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'CANCELLED'): Promise<ApiResponse<StockDocumentWithDetails[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data, error } = await supabase.from('StockDocument').select(`*, Contact (*), source_location:Location!StockDocument_sourceLocationId_fkey (id, name, Warehouse (name)), lines:StockMoveLine (*, Product (id, name, sku, UnitOfMeasure (abbreviation)))`).eq('type', 'DELIVERY').eq('status', status).order('scheduleDate', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as unknown as StockDocumentWithDetails[] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch deliveries by status' };
  }
}
