'use server';

import { createClerkSupabaseClientSsr } from '@/lib/supabase';
import { ApiResponse, Product, Contact, StockDocument } from '@/lib/types';

/**
 * Product below reorder point with details
 */
export interface ProductBelowReorderPoint {
  product: Product;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  quantityToOrder: number;
  preferredSupplier?: Contact;
}

/**
 * Purchase order line item
 */
export interface PurchaseOrderLine {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice?: number;
  subtotal?: number;
}

/**
 * Purchase order details
 */
export interface PurchaseOrder {
  supplierId: string;
  supplierName: string;
  lines: PurchaseOrderLine[];
  totalItems: number;
  totalQuantity: number;
  estimatedTotal?: number;
}

/**
 * Get products that are below their reorder point (minQuantity)
 * Useful for identifying which products need to be reordered
 */
export async function getProductsBelowReorderPoint(): Promise<ApiResponse<ProductBelowReorderPoint[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Get all active products with reorder points defined
    const { data: products, error: productsError } = await supabase
      .from('Product')
      .select('*')
      .eq('active', true)
      .not('minQuantity', 'is', null)
      .order('name', { ascending: true });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return { success: false, error: productsError.message };
    }

    if (!products || products.length === 0) {
      return { success: true, data: [] };
    }

    // For each product, calculate current total stock quantity
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        // Get all stock items for this product
        const { data: stockItems } = await supabase
          .from('StockItem')
          .select('quantity')
          .eq('productId', product.id);

        const currentQuantity = stockItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

        return {
          product,
          currentQuantity,
        };
      })
    );

    // Filter products below reorder point
    const productsBelowReorder: ProductBelowReorderPoint[] = [];

    for (const { product, currentQuantity } of productsWithStock) {
      if (product.minQuantity !== null && currentQuantity < product.minQuantity) {
        // Calculate quantity to order (order up to maxQuantity if defined, otherwise order 2x minQuantity)
        const targetQuantity = product.maxQuantity || product.minQuantity * 2;
        const quantityToOrder = Math.max(targetQuantity - currentQuantity, 0);

        // Get first vendor contact as default supplier if available
        let preferredSupplier: Contact | undefined;

        productsBelowReorder.push({
          product,
          currentQuantity,
          minQuantity: product.minQuantity,
          maxQuantity: product.maxQuantity || product.minQuantity * 2,
          quantityToOrder,
          preferredSupplier,
        });
      }
    }

    return { success: true, data: productsBelowReorder };
  } catch (error) {
    console.error('Unexpected error in getProductsBelowReorderPoint:', error);
    return { success: false, error: 'Failed to fetch products below reorder point' };
  }
}

/**
 * Generate purchase orders grouped by supplier for products below reorder point
 * Returns a list of purchase orders, one per supplier
 */
export async function generatePurchaseOrders(): Promise<ApiResponse<PurchaseOrder[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Get products below reorder point
    const result = await getProductsBelowReorderPoint();
    
    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Failed to get products below reorder point' };
    }

    const productsBelowReorder = result.data;

    if (productsBelowReorder.length === 0) {
      return { success: true, data: [], message: 'No products below reorder point' };
    }

    // Group products by supplier
    const supplierMap = new Map<string, {
      supplier: Contact;
      products: ProductBelowReorderPoint[];
    }>();

    // Get default supplier for products without preferred supplier
    const { data: defaultSupplier } = await supabase
      .from('Contact')
      .select('*')
      .eq('type', 'VENDOR')
      .limit(1)
      .single();

    for (const item of productsBelowReorder) {
      const supplier = item.preferredSupplier || defaultSupplier;
      
      if (!supplier) {
        console.warn(`No supplier found for product ${item.product.name}, skipping`);
        continue;
      }

      if (!supplierMap.has(supplier.id)) {
        supplierMap.set(supplier.id, {
          supplier,
          products: [],
        });
      }

      supplierMap.get(supplier.id)!.products.push(item);
    }

    // Generate purchase orders
    const purchaseOrders: PurchaseOrder[] = [];

    for (const [supplierId, { supplier, products }] of supplierMap) {
      const lines: PurchaseOrderLine[] = products.map((item) => {
        const unitPrice = item.product.unitCost || 0;
        const quantity = item.quantityToOrder;
        const subtotal = unitPrice * quantity;

        return {
          productId: item.product.id,
          productName: item.product.name,
          sku: item.product.sku,
          quantity,
          unitPrice,
          subtotal,
        };
      });

      const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
      const estimatedTotal = lines.reduce((sum, line) => sum + (line.subtotal || 0), 0);

      purchaseOrders.push({
        supplierId,
        supplierName: supplier.name,
        lines,
        totalItems: lines.length,
        totalQuantity,
        estimatedTotal,
      });
    }

    return {
      success: true,
      data: purchaseOrders,
      message: `Generated ${purchaseOrders.length} purchase order(s) for ${productsBelowReorder.length} product(s)`,
    };
  } catch (error) {
    console.error('Unexpected error in generatePurchaseOrders:', error);
    return { success: false, error: 'Failed to generate purchase orders' };
  }
}

/**
 * Create receipt documents from purchase orders
 * This creates DRAFT receipt documents that can be validated when stock arrives
 */
export async function createReceiptsFromPurchaseOrders(
  purchaseOrders: PurchaseOrder[],
  destinationLocationId: string,
  scheduleDate?: string
): Promise<ApiResponse<StockDocument[]>> {
  try {
    const supabase = await createClerkSupabaseClientSsr();

    // Validate destination location exists
    const { data: location, error: locationError } = await supabase
      .from('Location')
      .select('id')
      .eq('id', destinationLocationId)
      .single();

    if (locationError || !location) {
      return { success: false, error: 'Invalid destination location ID' };
    }

    const createdReceipts: StockDocument[] = [];

    for (const po of purchaseOrders) {
      // Generate reference number
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const reference = `PO-${timestamp}-${random}`;

      // Create receipt document
      const { data: receipt, error: receiptError } = await supabase
        .from('StockDocument')
        .insert({
          type: 'RECEIPT' as const,
          reference,
          contactId: po.supplierId,
          destLocationId: destinationLocationId,
          scheduleDate: scheduleDate || new Date().toISOString(),
          status: 'DRAFT' as const,
          notes: `Auto-generated from reorder suggestions. ${po.totalItems} item(s), ${po.totalQuantity} unit(s).`,
        })
        .select()
        .single();

      if (receiptError || !receipt) {
        console.error(`Error creating receipt for supplier ${po.supplierName}:`, receiptError);
        continue;
      }

      // Create move lines for each product
      const moveLineInserts = po.lines.map((line) => ({
        documentId: receipt.id,
        productId: line.productId,
        quantity: line.quantity,
        destLocationId: destinationLocationId,
      }));

      const { error: linesError } = await supabase
        .from('StockMoveLine')
        .insert(moveLineInserts);

      if (linesError) {
        console.error(`Error creating move lines for receipt ${receipt.reference}:`, linesError);
        // Still add the receipt even if lines failed
      }

      createdReceipts.push(receipt);
    }

    if (createdReceipts.length === 0) {
      return { success: false, error: 'Failed to create any receipt documents' };
    }

    return {
      success: true,
      data: createdReceipts,
      message: `Created ${createdReceipts.length} receipt document(s) from purchase orders`,
    };
  } catch (error) {
    console.error('Unexpected error in createReceiptsFromPurchaseOrders:', error);
    return { success: false, error: 'Failed to create receipts from purchase orders' };
  }
}

/**
 * Get reorder suggestions with full workflow
 * This is a convenience function that combines reorder detection and purchase order generation
 */
export async function getReorderSuggestions(): Promise<ApiResponse<{
  productsBelowReorder: ProductBelowReorderPoint[];
  purchaseOrders: PurchaseOrder[];
  totalProducts: number;
  totalOrders: number;
  totalQuantity: number;
  estimatedCost: number;
}>> {
  try {
    // Get products below reorder point
    const productsResult = await getProductsBelowReorderPoint();
    
    if (!productsResult.success || !productsResult.data) {
      return { success: false, error: productsResult.error || 'Failed to get products' };
    }

    // Generate purchase orders
    const ordersResult = await generatePurchaseOrders();
    
    if (!ordersResult.success || !ordersResult.data) {
      return { success: false, error: ordersResult.error || 'Failed to generate orders' };
    }

    const productsBelowReorder = productsResult.data;
    const purchaseOrders = ordersResult.data;

    const totalProducts = productsBelowReorder.length;
    const totalOrders = purchaseOrders.length;
    const totalQuantity = productsBelowReorder.reduce((sum, item) => sum + item.quantityToOrder, 0);
    const estimatedCost = purchaseOrders.reduce((sum, po) => sum + (po.estimatedTotal || 0), 0);

    return {
      success: true,
      data: {
        productsBelowReorder,
        purchaseOrders,
        totalProducts,
        totalOrders,
        totalQuantity,
        estimatedCost,
      },
      message: totalProducts > 0 
        ? `Found ${totalProducts} product(s) below reorder point` 
        : 'All products are above reorder point',
    };
  } catch (error) {
    console.error('Unexpected error in getReorderSuggestions:', error);
    return { success: false, error: 'Failed to get reorder suggestions' };
  }
}
