'use server';

import { createClerkSupabaseClientSsr } from '@/lib/supabase';
import { ApiResponse, Location, LocationInsert, LocationUpdate } from '@/lib/types';

/**
 * Get all locations
 */
export async function getLocations(): Promise<ApiResponse<Location[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('Location')
      .select(`
        *,
        Warehouse:warehouseId (
          id,
          name,
          shortCode
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching locations:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getLocations:', error);
    return { success: false, error: 'Failed to fetch locations' };
  }
}

/**
 * Get locations by warehouse ID
 */
export async function getLocationsByWarehouse(warehouseId: string): Promise<ApiResponse<Location[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('Location')
      .select('*')
      .eq('warehouseId', warehouseId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching locations by warehouse:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getLocationsByWarehouse:', error);
    return { success: false, error: 'Failed to fetch locations for warehouse' };
  }
}

/**
 * Get a single location by ID with stock count
 */
export async function getLocationById(locationId: string): Promise<ApiResponse<Location & { stockItemCount?: number }>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('Location')
      .select(`
        *,
        Warehouse:warehouseId (
          id,
          name,
          shortCode
        )
      `)
      .eq('id', locationId)
      .single();

    if (error) {
      console.error('Error fetching location:', error);
      return { success: false, error: error.message };
    }

    // Get stock items count
    const { count } = await supabase
      .from('StockItem')
      .select('*', { count: 'exact', head: true })
      .eq('locationId', locationId);

    return { success: true, data: { ...data, stockItemCount: count || 0 } };
  } catch (error) {
    console.error('Unexpected error in getLocationById:', error);
    return { success: false, error: 'Failed to fetch location' };
  }
}

/**
 * Create a new location
 */
export async function createLocation(
  location: LocationInsert
): Promise<ApiResponse<Location>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Validate warehouse exists (if provided)
    if (location.warehouseId) {
      const { data: warehouse, error: warehouseError } = await supabase
        .from('Warehouse')
        .select('id')
        .eq('id', location.warehouseId)
        .single();

      if (warehouseError || !warehouse) {
        return { success: false, error: 'Invalid warehouse ID' };
      }
    }

    const { data, error } = await supabase
      .from('Location')
      .insert(location)
      .select()
      .single();

    if (error) {
      console.error('Error creating location:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Location created successfully' };
  } catch (error) {
    console.error('Unexpected error in createLocation:', error);
    return { success: false, error: 'Failed to create location' };
  }
}

/**
 * Update an existing location
 */
export async function updateLocation(
  locationId: string,
  updates: LocationUpdate
): Promise<ApiResponse<Location>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Validate warehouse exists if being updated
    if (updates.warehouseId) {
      const { data: warehouse, error: warehouseError } = await supabase
        .from('Warehouse')
        .select('id')
        .eq('id', updates.warehouseId)
        .single();

      if (warehouseError || !warehouse) {
        return { success: false, error: 'Invalid warehouse ID' };
      }
    }

    const { data, error } = await supabase
      .from('Location')
      .update(updates)
      .eq('id', locationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating location:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Location updated successfully' };
  } catch (error) {
    console.error('Unexpected error in updateLocation:', error);
    return { success: false, error: 'Failed to update location' };
  }
}

/**
 * Delete a location
 * Note: Cannot delete if location has stock items
 */
export async function deleteLocation(locationId: string): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Check if location has stock items
    const { data: stockItems } = await supabase
      .from('StockItem')
      .select('id')
      .eq('locationId', locationId)
      .limit(1);

    if (stockItems && stockItems.length > 0) {
      return {
        success: false,
        error: 'Cannot delete location. There are stock items in this location. Move or remove stock first.',
      };
    }

    const { error } = await supabase.from('Location').delete().eq('id', locationId);

    if (error) {
      console.error('Error deleting location:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Location deleted successfully' };
  } catch (error) {
    console.error('Unexpected error in deleteLocation:', error);
    return { success: false, error: 'Failed to delete location' };
  }
}

/**
 * Get location statistics
 */
export async function getLocationStats(locationId: string): Promise<ApiResponse<{
  totalProducts: number;
  totalQuantity: number;
  occupancyPercentage: number;
}>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Get location details
    const { data: location } = await supabase
      .from('Location')
      .select('capacity')
      .eq('id', locationId)
      .single();

    // Get stock items in this location
    const { data: stockItems } = await supabase
      .from('StockItem')
      .select('productId, quantity')
      .eq('locationId', locationId);

    const uniqueProducts = new Set(stockItems?.map(item => item.productId) || []);
    const totalQuantity = stockItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    // Calculate occupancy percentage (if capacity is defined)
    let occupancyPercentage = 0;
    if (location?.capacity && location.capacity > 0) {
      occupancyPercentage = Math.round((totalQuantity / location.capacity) * 100);
    }

    return {
      success: true,
      data: {
        totalProducts: uniqueProducts.size,
        totalQuantity,
        occupancyPercentage,
      },
    };
  } catch (error) {
    console.error('Unexpected error in getLocationStats:', error);
    return { success: false, error: 'Failed to fetch location statistics' };
  }
}

/**
 * Get locations with stock item counts
 */
export async function getLocationsWithStats(): Promise<ApiResponse<Array<Location & { stockItemCount: number }>>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data: locations, error } = await supabase
      .from('Location')
      .select(`
        *,
        Warehouse:warehouseId (
          id,
          name,
          shortCode
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching locations:', error);
      return { success: false, error: error.message };
    }

    // Get stock item counts for each location
    const locationsWithCounts = await Promise.all(
      locations.map(async (location) => {
        const { count } = await supabase
          .from('StockItem')
          .select('*', { count: 'exact', head: true })
          .eq('locationId', location.id);

        return {
          ...location,
          stockItemCount: count || 0,
        };
      })
    );

    return { success: true, data: locationsWithCounts };
  } catch (error) {
    console.error('Unexpected error in getLocationsWithStats:', error);
    return { success: false, error: 'Failed to fetch locations with statistics' };
  }
}

/**
 * Get available locations for stock placement (locations with available capacity)
 */
export async function getAvailableLocations(warehouseId?: string): Promise<ApiResponse<Location[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    let query = supabase
      .from('Location')
      .select(`
        *,
        Warehouse:warehouseId (
          id,
          name,
          shortCode
        )
      `)
      .eq('active', true);

    if (warehouseId) {
      query = query.eq('warehouseId', warehouseId);
    }

    const { data: locations, error } = await query.order('name', { ascending: true });

    if (error) {
      console.error('Error fetching available locations:', error);
      return { success: false, error: error.message };
    }

    // Filter locations with available capacity
    const availableLocations: Location[] = [];
    
    for (const location of locations) {
      // If no capacity limit, location is available
      if (!location.capacity) {
        availableLocations.push(location);
        continue;
      }

      // Check current stock quantity in this location
      const { data: stockItems } = await supabase
        .from('StockItem')
        .select('quantity')
        .eq('locationId', location.id);

      const totalQuantity = stockItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

      // Add location if has available capacity
      if (totalQuantity < location.capacity) {
        availableLocations.push(location);
      }
    }

    return { success: true, data: availableLocations };
  } catch (error) {
    console.error('Unexpected error in getAvailableLocations:', error);
    return { success: false, error: 'Failed to fetch available locations' };
  }
}
