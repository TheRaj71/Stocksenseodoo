'use server';

import { createClerkSupabaseClientSsr } from '@/lib/supabase';
import {
  ApiResponse,
  Product,
  ProductInsert,
  ProductUpdate,
  ProductWithDetails,
  ProductFilters,
  StockLocationQuantity,
  Category,
  UnitOfMeasure,
} from '@/lib/types';
import { isValidSKU, generateReference } from '@/lib/utils';

/**
 * Get all products with optional filters
 */
export async function getProducts(
  filters?: ProductFilters
): Promise<ApiResponse<ProductWithDetails[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    let query = supabase
      .from('Product')
      .select(`
        *,
        Category (*),
        UnitOfMeasure (*)
      `)
      .order('name', { ascending: true });

    // Apply filters
    if (filters?.category_id) {
      query = query.eq('categoryId', filters.category_id);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('active', filters.is_active);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return { success: false, error: error.message };
    }

    // If filtering by low stock, calculate stock quantities
    let products = data as ProductWithDetails[];
    
    if (filters?.has_low_stock) {
      const productsWithStock = await Promise.all(
        products.map(async (product) => {
          const stockQty = await getProductStockQuantity(product.id);
          return {
            ...product,
            stock_quantity: stockQty.data || 0,
          };
        })
      );
      
      products = productsWithStock.filter(
        (p) => p.minQuantity && p.stock_quantity! < p.minQuantity
      );
    }

    return { success: true, data: products };
  } catch (error) {
    console.error('Unexpected error in getProducts:', error);
    return { success: false, error: 'Failed to fetch products' };
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(
  productId: string
): Promise<ApiResponse<ProductWithDetails>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('Product')
      .select(`
        *,
        Category (*),
        UnitOfMeasure (*)
      `)
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return { success: false, error: error.message };
    }

    // Get current stock quantity
    const stockQty = await getProductStockQuantity(productId);
    
    const productWithStock: ProductWithDetails = {
      ...data,
      stock_quantity: stockQty.data || 0,
    };

    return { success: true, data: productWithStock };
  } catch (error) {
    console.error('Unexpected error in getProductById:', error);
    return { success: false, error: 'Failed to fetch product' };
  }
}

/**
 * Create a new product
 */
export async function createProduct(
  product: ProductInsert
): Promise<ApiResponse<Product>> {
  try {
    // Validate SKU format
    if (product.sku && !isValidSKU(product.sku)) {
      return {
        success: false,
        error: 'Invalid SKU format. Use only letters, numbers, dashes, and underscores.',
      };
    }

    const supabase = await createClerkSupabaseClientSsr();

    // Check if SKU already exists
    if (product.sku) {
      const { data: existing } = await supabase
        .from('Product')
        .select('id')
        .eq('sku', product.sku)
        .single();

      if (existing) {
        return { success: false, error: 'Product with this SKU already exists' };
      }
    }

    const { data, error } = await supabase
      .from('Product')
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Product created successfully' };
  } catch (error) {
    console.error('Unexpected error in createProduct:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  productId: string,
  updates: ProductUpdate
): Promise<ApiResponse<Product>> {
  try {
    // Validate SKU format if provided
    if (updates.sku && !isValidSKU(updates.sku)) {
      return {
        success: false,
        error: 'Invalid SKU format. Use only letters, numbers, dashes, and underscores.',
      };
    }

    const supabase = await createClerkSupabaseClientSsr();

    // Check if new SKU already exists (if SKU is being updated)
    if (updates.sku) {
      const { data: existing } = await supabase
        .from('Product')
        .select('id')
        .eq('sku', updates.sku)
        .neq('id', productId)
        .single();

      if (existing) {
        return { success: false, error: 'Product with this SKU already exists' };
      }
    }

    const { data, error } = await supabase
      .from('Product')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Product updated successfully' };
  } catch (error) {
    console.error('Unexpected error in updateProduct:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

/**
 * Delete a product (soft delete by setting active = false)
 */
export async function deleteProduct(productId: string): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Check if product has stock movements
    const { data: movements } = await supabase
      .from('StockMoveLine')
      .select('id')
      .eq('productId', productId)
      .limit(1);

    if (movements && movements.length > 0) {
      // Soft delete - set active to false
      const { error } = await supabase
        .from('Product')
        .update({ active: false })
        .eq('id', productId);

      if (error) {
        console.error('Error deactivating product:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Product deactivated successfully (has transaction history)',
      };
    }

    // Hard delete if no movements
    const { error } = await supabase.from('Product').delete().eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    console.error('Unexpected error in deleteProduct:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

/**
 * Get total stock quantity for a product (all locations)
 */
export async function getProductStockQuantity(
  productId: string
): Promise<ApiResponse<number>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('StockItem')
      .select('quantity')
      .eq('productId', productId);

    if (error) {
      console.error('Error fetching stock quantity:', error);
      return { success: false, error: error.message };
    }

    const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);

    return { success: true, data: totalQuantity };
  } catch (error) {
    console.error('Unexpected error in getProductStockQuantity:', error);
    return { success: false, error: 'Failed to fetch stock quantity' };
  }
}

/**
 * Get stock quantity for a product by location
 */
export async function getProductStockByLocation(
  productId: string
): Promise<ApiResponse<StockLocationQuantity[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('StockItem')
      .select(`
        quantity,
        locationId,
        Location (
          id,
          name,
          Warehouse (
            name
          )
        )
      `)
      .eq('productId', productId)
      .gt('quantity', 0);

    if (error) {
      console.error('Error fetching stock by location:', error);
      return { success: false, error: error.message };
    }

    const stockByLocation: StockLocationQuantity[] = data.map((item: any) => ({
      location_id: item.Location.id,
      location_name: item.Location.name,
      warehouse_name: item.Location.Warehouse.name,
      quantity: item.quantity,
    }));

    return { success: true, data: stockByLocation };
  } catch (error) {
    console.error('Unexpected error in getProductStockByLocation:', error);
    return { success: false, error: 'Failed to fetch stock by location' };
  }
}

/**
 * Get all product categories
 */
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('Category')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getCategories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

/**
 * Get all units of measure
 */
export async function getUnitsOfMeasure(): Promise<ApiResponse<UnitOfMeasure[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('UnitOfMeasure')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching units of measure:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getUnitsOfMeasure:', error);
    return { success: false, error: 'Failed to fetch units of measure' };
  }
}

/**
 * Create a new category
 */
export async function createCategory(
  name: string,
  description?: string
): Promise<ApiResponse<Category>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('Category')
      .insert({ name, description })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Category created successfully' };
  } catch (error) {
    console.error('Unexpected error in createCategory:', error);
    return { success: false, error: 'Failed to create category' };
  }
}

/**
 * Create a new unit of measure
 */
export async function createUnitOfMeasure(
  name: string,
  abbreviation: string
): Promise<ApiResponse<UnitOfMeasure>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('UnitOfMeasure')
      .insert({ name, abbreviation, symbol: abbreviation })
      .select()
      .single();

    if (error) {
      console.error('Error creating unit of measure:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Unit of measure created successfully' };
  } catch (error) {
    console.error('Unexpected error in createUnitOfMeasure:', error);
    return { success: false, error: 'Failed to create unit of measure' };
  }
}

/**
 * Set initial stock for a product at a specific location
 * Creates a special adjustment document to record the initial stock
 */
export async function setInitialStock(
  productId: string,
  locationId: string,
  quantity: number,
  notes?: string
): Promise<ApiResponse<void>> {
  try {
    if (quantity < 0) {
      return { success: false, error: 'Initial stock quantity must be positive' };
    }

    if (quantity === 0) {
      return { success: true, message: 'No initial stock to set' };
    }

    const supabase = await createClerkSupabaseClientSsr();

    // Check if product exists
    const { data: product } = await supabase
      .from('Product')
      .select('id, name')
      .eq('id', productId)
      .single();

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Check if location exists
    const { data: location } = await supabase
      .from('Location')
      .select('id, name')
      .eq('id', locationId)
      .single();

    if (!location) {
      return { success: false, error: 'Location not found' };
    }

    // Check if stock already exists at this location
    const { data: existingStock } = await supabase
      .from('StockItem')
      .select('quantity')
      .eq('productId', productId)
      .eq('locationId', locationId)
      .single();

    if (existingStock && existingStock.quantity > 0) {
      return {
        success: false,
        error: `Stock already exists at this location (${existingStock.quantity} units). Use stock adjustment instead.`,
      };
    }

    // Generate reference for adjustment document
    const { count } = await supabase
      .from('StockDocument')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'ADJUSTMENT');

    const reference = generateReference('INIT', (count || 0) + 1);

    // Create adjustment document
    const { data: doc } = await supabase
      .from('StockDocument')
      .insert({
        type: 'ADJUSTMENT',
        reference,
        status: 'DRAFT',
        scheduleDate: new Date().toISOString(),
        destLocationId: locationId,
        notes: notes || `Initial stock for ${product.name} at ${location.name}`,
      })
      .select()
      .single();

    if (!doc) {
      return { success: false, error: 'Failed to create adjustment document' };
    }

    // Create adjustment line
    await supabase.from('StockMoveLine').insert({
      documentId: doc.id,
      productId,
      quantity,
      sourceLocationId: null,
      destLocationId: locationId,
    });

    // Create or update stock item
    if (existingStock) {
      await supabase
        .from('StockItem')
        .update({ quantity })
        .eq('productId', productId)
        .eq('locationId', locationId);
    } else {
      await supabase.from('StockItem').insert({
        productId,
        locationId,
        quantity,
      });
    }

    // Mark adjustment as done
    await supabase
      .from('StockDocument')
      .update({
        status: 'DONE',
        validatedAt: new Date().toISOString(),
        doneDate: new Date().toISOString(),
      })
      .eq('id', doc.id);

    return {
      success: true,
      message: `Initial stock of ${quantity} units set for ${product.name} at ${location.name}`,
    };
  } catch (error) {
    console.error('Unexpected error in setInitialStock:', error);
    return { success: false, error: 'Failed to set initial stock' };
  }
}
