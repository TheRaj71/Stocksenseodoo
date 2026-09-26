'use server';

import { createClerkSupabaseClientSsr } from '@/lib/supabase';
import { ApiResponse, StockDocument, StockDocumentInsert, StockDocumentWithDetails, StockMoveLine, StockMoveLineInsert, DocumentFilters, Warehouse, Location } from '@/lib/types';
import { generateReference } from '@/lib/utils';

export async function getInternalTransfers(filters?: DocumentFilters): Promise<ApiResponse<StockDocumentWithDetails[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    let query = supabase.from('StockDocument').select(`*, source_location:Location!StockDocument_sourceLocationId_fkey (id, name, Warehouse (name)), destination_location:Location!StockDocument_destLocationId_fkey (id, name, Warehouse (name)), lines:StockMoveLine (*, Product (id, name, sku, UnitOfMeasure (abbreviation)))`).eq('type', 'INTERNAL_TRANSFER').order('scheduleDate', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.source_location_id) query = query.eq('sourceLocationId', filters.source_location_id);
    if (filters?.destination_location_id) query = query.eq('destLocationId', filters.destination_location_id);
    if (filters?.date_from) query = query.gte('scheduleDate', filters.date_from);
    if (filters?.date_to) query = query.lte('scheduleDate', filters.date_to);
    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as unknown as StockDocumentWithDetails[] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch internal transfers' };
  }
}

export async function createInternalTransfer(transfer: Omit<StockDocumentInsert, 'type' | 'reference'>): Promise<ApiResponse<StockDocument>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    if (!transfer.sourceLocationId || !transfer.destLocationId) return { success: false, error: 'Both source and destination locations are required' };
    if (transfer.sourceLocationId === transfer.destLocationId) return { success: false, error: 'Source and destination locations must be different' };
    const { count } = await supabase.from('StockDocument').select('*', { count: 'exact', head: true }).eq('type', 'INTERNAL_TRANSFER');
    const reference = generateReference('INT', (count || 0) + 1);
    const { data, error } = await supabase.from('StockDocument').insert({ ...transfer, type: 'INTERNAL_TRANSFER', reference, status: 'DRAFT' }).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data, message: 'Internal transfer created successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to create internal transfer' };
  }
}

export async function addInternalTransferLine(transferId: string, line: Omit<StockMoveLineInsert, 'documentId'>): Promise<ApiResponse<StockMoveLine>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data: transfer } = await supabase.from('StockDocument').select('status, sourceLocationId, destLocationId').eq('id', transferId).single();
    if (transfer?.status !== 'DRAFT') return { success: false, error: 'Can only add lines to draft transfers' };
    const sourceLocationId = line.sourceLocationId || transfer.sourceLocationId;
    const destLocationId = line.destLocationId || transfer.destLocationId;
    if (!sourceLocationId || !destLocationId) return { success: false, error: 'Source and destination locations are required' };
    const { data: stockItem } = await supabase.from('StockItem').select('quantity').eq('productId', line.productId).eq('locationId', sourceLocationId).single();
    if (!stockItem || stockItem.quantity < line.quantity) return { success: false, error: `Insufficient stock at source. Available: ${stockItem?.quantity || 0}, Requested: ${line.quantity}` };
    const { data, error } = await supabase.from('StockMoveLine').insert({ ...line, documentId: transferId, sourceLocationId, destLocationId }).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data, message: 'Product added to transfer' };
  } catch (error) {
    return { success: false, error: 'Failed to add product to transfer' };
  }
}

export async function validateInternalTransfer(transferId: string): Promise<ApiResponse<StockDocument>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data: transfer } = await supabase.from('StockDocument').select(`*, lines:StockMoveLine (*)`).eq('id', transferId).single();
    if (transfer?.status !== 'DRAFT') return { success: false, error: 'Only draft transfers can be validated' };
    if (!transfer?.lines || transfer.lines.length === 0) return { success: false, error: 'Transfer must have at least one product line' };
    for (const line of transfer.lines) {
      const sourceLocationId = line.sourceLocationId || transfer.sourceLocationId;
      const destLocationId = line.destLocationId || transfer.destLocationId;
      if (!sourceLocationId || !destLocationId) return { success: false, error: 'Source and destination locations are required' };
      const { data: sourceStock } = await supabase.from('StockItem').select('*').eq('productId', line.productId).eq('locationId', sourceLocationId).single();
      if (!sourceStock || sourceStock.quantity < line.quantity) return { success: false, error: `Insufficient stock at source. Available: ${sourceStock?.quantity || 0}, Required: ${line.quantity}` };
      await supabase.from('StockItem').update({ quantity: sourceStock.quantity - line.quantity }).eq('id', sourceStock.id);
      const { data: destStock } = await supabase.from('StockItem').select('*').eq('productId', line.productId).eq('locationId', destLocationId).single();
      if (destStock) {
        await supabase.from('StockItem').update({ quantity: destStock.quantity + line.quantity }).eq('id', destStock.id);
      } else {
        await supabase.from('StockItem').insert({ productId: line.productId, locationId: destLocationId, quantity: line.quantity });
      }
    }
    const { data, error } = await supabase.from('StockDocument').update({ status: 'DONE', validatedAt: new Date().toISOString(), doneDate: new Date().toISOString() }).eq('id', transferId).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data, message: 'Internal transfer validated successfully. Stock moved.' };
  } catch (error) {
    return { success: false, error: 'Failed to validate internal transfer' };
  }
}

export async function getStockAdjustments(filters?: DocumentFilters): Promise<ApiResponse<StockDocumentWithDetails[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    let query = supabase.from('StockDocument').select(`*, destination_location:Location!StockDocument_destLocationId_fkey (id, name, Warehouse (name)), lines:StockMoveLine (*, Product (id, name, sku, UnitOfMeasure (abbreviation)))`).eq('type', 'ADJUSTMENT').order('scheduleDate', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.destination_location_id) query = query.eq('destLocationId', filters.destination_location_id);
    if (filters?.date_from) query = query.gte('scheduleDate', filters.date_from);
    if (filters?.date_to) query = query.lte('scheduleDate', filters.date_to);
    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as unknown as StockDocumentWithDetails[] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch stock adjustments' };
  }
}

export async function createStockAdjustment(productId: string, locationId: string, countedQuantity: number, notes?: string): Promise<ApiResponse<StockDocument>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data: stockItem } = await supabase.from('StockItem').select('quantity').eq('productId', productId).eq('locationId', locationId).single();
    const currentQuantity = stockItem?.quantity || 0;
    const adjustmentQuantity = countedQuantity - currentQuantity;
    if (adjustmentQuantity === 0) return { success: false, error: 'No adjustment needed. Counted quantity matches current stock.' };
    const { count } = await supabase.from('StockDocument').select('*', { count: 'exact', head: true }).eq('type', 'ADJUSTMENT');
    const reference = generateReference('ADJ', (count || 0) + 1);
    const { data: doc } = await supabase.from('StockDocument').insert({ type: 'ADJUSTMENT', reference, status: 'DRAFT', scheduleDate: new Date().toISOString(), destLocationId: locationId, notes: notes || `Stock adjustment. Counted: ${countedQuantity}, System: ${currentQuantity}, Difference: ${adjustmentQuantity}` }).select().single();
    if (!doc) return { success: false, error: 'Failed to create adjustment document' };
    await supabase.from('StockMoveLine').insert({ documentId: doc.id, productId, quantity: Math.abs(adjustmentQuantity), sourceLocationId: adjustmentQuantity < 0 ? locationId : null, destLocationId: adjustmentQuantity > 0 ? locationId : null });
    const validateResult = await validateStockAdjustment(doc.id);
    if (!validateResult.success) return validateResult;
    return { success: true, data: validateResult.data!, message: `Stock adjustment created. ${adjustmentQuantity > 0 ? 'Added' : 'Removed'} ${Math.abs(adjustmentQuantity)} units.` };
  } catch (error) {
    return { success: false, error: 'Failed to create stock adjustment' };
  }
}

export async function validateStockAdjustment(adjustmentId: string): Promise<ApiResponse<StockDocument>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data: adjustment } = await supabase.from('StockDocument').select(`*, lines:StockMoveLine (*)`).eq('id', adjustmentId).single();
    if (adjustment?.status !== 'DRAFT') return { success: false, error: 'Only draft adjustments can be validated' };
    for (const line of adjustment?.lines || []) {
      const locationId = line.destLocationId || line.sourceLocationId;
      if (!locationId) continue;
      const { data: stockItem } = await supabase.from('StockItem').select('*').eq('productId', line.productId).eq('locationId', locationId).single();
      if (line.destLocationId) {
        if (stockItem) {
          await supabase.from('StockItem').update({ quantity: stockItem.quantity + line.quantity }).eq('id', stockItem.id);
        } else {
          await supabase.from('StockItem').insert({ productId: line.productId, locationId, quantity: line.quantity });
        }
      } else if (stockItem) {
        await supabase.from('StockItem').update({ quantity: Math.max(0, stockItem.quantity - line.quantity) }).eq('id', stockItem.id);
      }
    }
    const { data, error } = await supabase.from('StockDocument').update({ status: 'DONE', validatedAt: new Date().toISOString(), doneDate: new Date().toISOString() }).eq('id', adjustmentId).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data, message: 'Stock adjustment validated successfully.' };
  } catch (error) {
    return { success: false, error: 'Failed to validate stock adjustment' };
  }
}

export async function getProductMovementHistory(productId: string, limit = 50): Promise<ApiResponse<any[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data, error } = await supabase.from('StockMoveLine').select(`*, StockDocument (*), Product (id, name, sku), source_location:Location!StockMoveLine_sourceLocationId_fkey (id, name, Warehouse (name)), destination_location:Location!StockMoveLine_destLocationId_fkey (id, name, Warehouse (name))`).eq('productId', productId).order('createdAt', { ascending: false }).limit(limit);
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch movement history' };
  }
}

export async function getWarehouses(): Promise<ApiResponse<Warehouse[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data, error } = await supabase.from('Warehouse').select('*').order('name', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch warehouses' };
  }
}

export async function getLocations(warehouseId?: string): Promise<ApiResponse<Location[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    let query = supabase.from('Location').select('*, Warehouse (*)').order('name', { ascending: true });
    if (warehouseId) query = query.eq('warehouseId', warehouseId);
    const { data, error} = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch locations' };
  }
}
