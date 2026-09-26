'use server';

import { createClerkSupabaseClientSsr } from '@/lib/supabase';
import { ApiResponse, DashboardKPIs, StockAlert } from '@/lib/types';

export async function getDashboardKPIs(): Promise<ApiResponse<DashboardKPIs>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { count: totalProducts } = await supabase.from('Product').select('*', { count: 'exact', head: true }).eq('active', true);
    const { count: totalStockItems } = await supabase.from('StockItem').select('*', { count: 'exact', head: true });
    const { data: products } = await supabase.from('Product').select('id, minQuantity').eq('active', true).not('minQuantity', 'is', null);
    let lowStockCount = 0, outOfStockCount = 0;
    if (products) {
      for (const product of products) {
        const { data: stockItems } = await supabase.from('StockItem').select('quantity').eq('productId', product.id);
        const totalQty = stockItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        if (totalQty === 0) outOfStockCount++;
        else if (product.minQuantity && totalQty < product.minQuantity) lowStockCount++;
      }
    }
    const { count: pendingReceipts } = await supabase.from('StockDocument').select('*', { count: 'exact', head: true }).eq('type', 'RECEIPT').in('status', ['DRAFT', 'WAITING']);
    const { count: pendingDeliveries } = await supabase.from('StockDocument').select('*', { count: 'exact', head: true }).eq('type', 'DELIVERY').in('status', ['DRAFT', 'WAITING']);
    const { count: internalTransfers } = await supabase.from('StockDocument').select('*', { count: 'exact', head: true }).eq('type', 'INTERNAL_TRANSFER').in('status', ['DRAFT', 'WAITING']);
    return { success: true, data: { total_products: totalProducts || 0, total_stock_items: totalStockItems || 0, low_stock_items: lowStockCount, out_of_stock_items: outOfStockCount, pending_receipts: pendingReceipts || 0, pending_deliveries: pendingDeliveries || 0, internal_transfers_scheduled: internalTransfers || 0 } };
  } catch (error) {
    return { success: false, error: 'Failed to fetch dashboard KPIs' };
  }
}

export async function getStockAlerts(): Promise<ApiResponse<StockAlert[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data: products } = await supabase.from('Product').select('id, name, sku, minQuantity, maxQuantity').eq('active', true).or('minQuantity.not.is.null,maxQuantity.not.is.null');
    const alerts: StockAlert[] = [];
    if (products) {
      for (const product of products) {
        const { data: stockItems } = await supabase.from('StockItem').select('quantity').eq('productId', product.id);
        const totalQty = stockItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        let alertType: 'low_stock' | 'out_of_stock' | 'overstock' | null = null;
        if (totalQty === 0) alertType = 'out_of_stock';
        else if (product.minQuantity && totalQty < product.minQuantity) alertType = 'low_stock';
        else if (product.maxQuantity && totalQty > product.maxQuantity) alertType = 'overstock';
        if (alertType) alerts.push({ product_id: product.id, product_name: product.name, sku: product.sku, current_quantity: totalQty, min_quantity: product.minQuantity || 0, max_quantity: product.maxQuantity || 0, alert_type: alertType });
      }
    }
    alerts.sort((a, b) => { const priority = { out_of_stock: 0, low_stock: 1, overstock: 2 }; return priority[a.alert_type] - priority[b.alert_type]; });
    return { success: true, data: alerts };
  } catch (error) {
    return { success: false, error: 'Failed to fetch stock alerts' };
  }
}

export async function getDocumentCountsByStatus(): Promise<ApiResponse<Record<string, Record<string, number>>>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data } = await supabase.from('StockDocument').select('type, status');
    const counts: Record<string, Record<string, number>> = { RECEIPT: { DRAFT: 0, WAITING: 0, READY: 0, DONE: 0, CANCELLED: 0 }, DELIVERY: { DRAFT: 0, WAITING: 0, READY: 0, DONE: 0, CANCELLED: 0 }, INTERNAL_TRANSFER: { DRAFT: 0, WAITING: 0, READY: 0, DONE: 0, CANCELLED: 0 }, ADJUSTMENT: { DRAFT: 0, WAITING: 0, READY: 0, DONE: 0, CANCELLED: 0 } };
    if (data) data.forEach((doc) => { if (counts[doc.type]) counts[doc.type][doc.status] = (counts[doc.type][doc.status] || 0) + 1; });
    return { success: true, data: counts };
  } catch (error) {
    return { success: false, error: 'Failed to fetch document counts' };
  }
}

export async function getRecentStockMovements(): Promise<ApiResponse<any[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data, error } = await supabase.from('StockMoveLine').select(`*, StockDocument (reference, type, status, scheduleDate), Product (name, sku), source_location:Location!StockMoveLine_sourceLocationId_fkey (name, Warehouse (name)), destination_location:Location!StockMoveLine_destLocationId_fkey (name, Warehouse (name))`).order('createdAt', { ascending: false }).limit(20);
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch recent stock movements' };
  }
}

export async function getLowStockProducts(): Promise<ApiResponse<Array<{ product_id: string; product_name: string; sku: string; current_quantity: number; min_quantity: number; category: string }>>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();
    const { data: products } = await supabase.from('Product').select('id, name, sku, minQuantity, Category (name)').eq('active', true).not('minQuantity', 'is', null);
    const lowStockProducts: Array<{ product_id: string; product_name: string; sku: string; current_quantity: number; min_quantity: number; category: string }> = [];
    if (products) {
      for (const product of products as any[]) {
        const { data: stockItems } = await supabase.from('StockItem').select('quantity').eq('productId', product.id);
        const totalQty = stockItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        if (totalQty < product.minQuantity) lowStockProducts.push({ product_id: product.id, product_name: product.name, sku: product.sku, current_quantity: totalQty, min_quantity: product.minQuantity, category: product.Category?.name || 'Uncategorized' });
      }
    }
    lowStockProducts.sort((a, b) => { const aPercent = a.current_quantity / a.min_quantity; const bPercent = b.current_quantity / b.min_quantity; return aPercent - bPercent; });
    return { success: true, data: lowStockProducts };
  } catch (error) {
    return { success: false, error: 'Failed to fetch low stock products' };
  }
}
