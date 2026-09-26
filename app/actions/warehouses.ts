'use server';

import { createClerkSupabaseClientSsr } from '@/lib/supabase';
import { ApiResponse, Warehouse, WarehouseInsert, WarehouseUpdate } from '@/lib/types';

/**
 * Get all warehouses
 */
export async function getWarehouses(): Promise<ApiResponse<Warehouse[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('Warehouse')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching warehouses:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getWarehouses:', error);
    return { success: false, error: 'Failed to fetch warehouses' };
  }
}

/**
 * Get a single warehouse by ID with location count
 */
export async function getWarehouseById(warehouseId: string): Promise<ApiResponse<Warehouse & { locationCount?: number }>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('Warehouse')
      .select('*')
      .eq('id', warehouseId)
      .single();

    if (error) {
      console.error('Error fetching warehouse:', error);
      return { success: false, error: error.message };
    }

    // Get location count
    const { count } = await supabase
      .from('Location')
      .select('*', { count: 'exact', head: true })
      .eq('warehouseId', warehouseId);

    return { success: true, data: { ...data, locationCount: count || 0 } };
  } catch (error) {
    console.error('Unexpected error in getWarehouseById:', error);
    return { success: false, error: 'Failed to fetch warehouse' };
  }
}

/**
 * Create a new warehouse
 */
export async function createWarehouse(
  warehouse: WarehouseInsert
): Promise<ApiResponse<Warehouse>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Validate short code format (uppercase alphanumeric)
    if (warehouse.shortCode && !/^[A-Z0-9-]+$/.test(warehouse.shortCode)) {
      return {
        success: false,
        error: 'Short code must contain only uppercase letters, numbers, and hyphens',
      };
    }

    // Check if short code already exists
    const { data: existing } = await supabase
      .from('Warehouse')
      .select('id')
      .eq('shortCode', warehouse.shortCode)
      .single();

    if (existing) {
      return { success: false, error: 'Warehouse with this short code already exists' };
    }

    const { data, error } = await supabase
      .from('Warehouse')
      .insert(warehouse)
      .select()
      .single();

    if (error) {
      console.error('Error creating warehouse:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Warehouse created successfully' };
  } catch (error) {
    console.error('Unexpected error in createWarehouse:', error);
    return { success: false, error: 'Failed to create warehouse' };
  }
}

/**
 * Update an existing warehouse
 */
export async function updateWarehouse(
  warehouseId: string,
  updates: WarehouseUpdate
): Promise<ApiResponse<Warehouse>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Validate short code format if provided
    if (updates.shortCode && !/^[A-Z0-9-]+$/.test(updates.shortCode)) {
      return {
        success: false,
        error: 'Short code must contain only uppercase letters, numbers, and hyphens',
      };
    }

    // Check if new short code already exists (if short code is being updated)
    if (updates.shortCode) {
      const { data: existing } = await supabase
        .from('Warehouse')
        .select('id')
        .eq('shortCode', updates.shortCode)
        .neq('id', warehouseId)
        .single();

      if (existing) {
        return { success: false, error: 'Warehouse with this short code already exists' };
      }
    }

    const { data, error } = await supabase
      .from('Warehouse')
      .update(updates)
      .eq('id', warehouseId)
      .select()
      .single();

    if (error) {
      console.error('Error updating warehouse:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Warehouse updated successfully' };
  } catch (error) {
    console.error('Unexpected error in updateWarehouse:', error);
    return { success: false, error: 'Failed to update warehouse' };
  }
}

/**
 * Delete a warehouse
 * Note: Cannot delete if warehouse has locations
 */
export async function deleteWarehouse(warehouseId: string): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Check if warehouse has locations
    const { data: locations } = await supabase
      .from('Location')
      .select('id')
      .eq('warehouseId', warehouseId)
      .limit(1);

    if (locations && locations.length > 0) {
      return {
        success: false,
        error: 'Cannot delete warehouse. There are associated locations. Delete locations first.',
      };
    }

    const { error } = await supabase.from('Warehouse').delete().eq('id', warehouseId);

    if (error) {
      console.error('Error deleting warehouse:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Warehouse deleted successfully' };
  } catch (error) {
    console.error('Unexpected error in deleteWarehouse:', error);
    return { success: false, error: 'Failed to delete warehouse' };
  }
}

/**
 * Get warehouse statistics
 */
export async function getWarehouseStats(warehouseId: string): Promise<ApiResponse<{
  totalLocations: number;
  totalProducts: number;
  totalStockQuantity: number;
}>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Get locations count
    const { count: locationsCount } = await supabase
      .from('Location')
      .select('*', { count: 'exact', head: true })
      .eq('warehouseId', warehouseId);

    // Get locations IDs
    const { data: locations } = await supabase
      .from('Location')
      .select('id')
      .eq('warehouseId', warehouseId);

    if (!locations || locations.length === 0) {
      return {
        success: true,
        data: {
          totalLocations: 0,
          totalProducts: 0,
          totalStockQuantity: 0,
        },
      };
    }

    const locationIds = locations.map(loc => loc.id);

    // Get stock items in these locations
    const { data: stockItems } = await supabase
      .from('StockItem')
      .select('productId, quantity')
      .in('locationId', locationIds);

    const uniqueProducts = new Set(stockItems?.map(item => item.productId) || []);
    const totalQuantity = stockItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return {
      success: true,
      data: {
        totalLocations: locationsCount || 0,
        totalProducts: uniqueProducts.size,
        totalStockQuantity: totalQuantity,
      },
    };
  } catch (error) {
    console.error('Unexpected error in getWarehouseStats:', error);
    return { success: false, error: 'Failed to fetch warehouse statistics' };
  }
}

/**
 * Get warehouses with location counts
 */
export async function getWarehousesWithStats(): Promise<ApiResponse<Array<Warehouse & { locationCount: number }>>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data: warehouses, error } = await supabase
      .from('Warehouse')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching warehouses:', error);
      return { success: false, error: error.message };
    }

    // Get location counts for each warehouse
    const warehousesWithCounts = await Promise.all(
      warehouses.map(async (warehouse) => {
        const { count } = await supabase
          .from('Location')
          .select('*', { count: 'exact', head: true })
          .eq('warehouseId', warehouse.id);

        return {
          ...warehouse,
          locationCount: count || 0,
        };
      })
    );

    return { success: true, data: warehousesWithCounts };
  } catch (error) {
    console.error('Unexpected error in getWarehousesWithStats:', error);
    return { success: false, error: 'Failed to fetch warehouses with statistics' };
  }
}
