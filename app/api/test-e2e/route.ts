import { NextResponse } from 'next/server';
import { 
  getProducts, 
  createProduct, 
  getProductById, 
  getProductStockQuantity,
  getProductStockByLocation,
  getCategories,
  getUnitsOfMeasure
} from '@/app/actions/products';

import { 
  getReceipts, 
  createReceipt, 
  addReceiptLine, 
  validateReceipt, 
  getSuppliers 
} from '@/app/actions/receipts';

import { 
  getDeliveries, 
  createDelivery, 
  addDeliveryLine, 
  validateDelivery, 
  getCustomers 
} from '@/app/actions/deliveries';

import { 
  getInternalTransfers, 
  createInternalTransfer, 
  addInternalTransferLine, 
  validateInternalTransfer, 
  createStockAdjustment,
  getProductMovementHistory,
  getWarehouses,
  getLocations
} from '@/app/actions/stock';

import { getDashboardKPIs, getStockAlerts } from '@/app/actions/dashboard';

export async function GET() {
  const log: string[] = [];
  const results: Record<string, any> = {};

  try {
    log.push('1. Fetching Master Data (Categories, UOMs, Locations)...');
    const [catRes, uomRes, locRes, whRes] = await Promise.all([
      getCategories(),
      getUnitsOfMeasure(),
      getLocations(),
      getWarehouses(),
    ]);

    results.masterData = {
      categories: catRes.data?.length || 0,
      uoms: uomRes.data?.length || 0,
      locations: locRes.data?.length || 0,
      warehouses: whRes.data?.length || 0,
    };

    const categoryId = catRes.data?.[0]?.id;
    const uomId = uomRes.data?.[0]?.id;
    const internalLocs = locRes.data?.filter((l) => l.type === 'INTERNAL') || [];
    const stockLoc = internalLocs.find((l) => l.shortCode === 'Stock') || internalLocs[0];
    const prodLoc = internalLocs.find((l) => l.shortCode === 'Prod') || internalLocs[1] || internalLocs[0];

    if (!categoryId || !uomId || !stockLoc) {
      throw new Error('Missing base seed data');
    }

    // 2. Create Product
    const testSku = `BOLT-${Date.now().toString().slice(-4)}`;
    log.push(`2. Creating Product SKU: ${testSku}...`);
    const prodRes = await createProduct({
      name: `High-Tensile Industrial Bolt ${testSku}`,
      sku: testSku,
      categoryId,
      uomId,
      unitCost: 8.50,
      minQuantity: 15,
      maxQuantity: 150,
      reorderPoint: 25,
      reorderQty: 80,
      active: true,
    });

    if (!prodRes.success || !prodRes.data) {
      throw new Error(`Product create failed: ${prodRes.error}`);
    }
    const product = prodRes.data;
    results.productCreated = { id: product.id, sku: product.sku };

    // 3. Receipt Flow (+100)
    log.push('3. Inbound Receipt Flow (Supplier -> Stock +100)...');
    const supRes = await getSuppliers();
    const supplier = supRes.data?.[0];

    const recRes = await createReceipt({
      contactId: supplier?.id || null,
      destLocationId: stockLoc.id,
      scheduleDate: new Date().toISOString(),
      notes: 'Automated E2E Receipt Test',
    });

    if (!recRes.success || !recRes.data) {
      throw new Error(`Receipt create failed: ${recRes.error}`);
    }
    const receipt = recRes.data;

    await addReceiptLine(receipt.id, {
      productId: product.id,
      quantity: 100,
      destLocationId: stockLoc.id,
    });

    const valRecRes = await validateReceipt(receipt.id);
    if (!valRecRes.success) throw new Error(`Receipt validation failed: ${valRecRes.error}`);

    const stockAfterRec = await getProductStockQuantity(product.id);
    results.receiptFlow = {
      reference: receipt.reference,
      stockAfterReceipt: stockAfterRec.data,
      expected: 100,
      passed: stockAfterRec.data === 100,
    };

    // 4. Internal Transfer Flow (30 units Stock -> Prod)
    log.push('4. Internal Transfer Flow (30 units to Prod Floor)...');
    const transRes = await createInternalTransfer({
      sourceLocationId: stockLoc.id,
      destLocationId: prodLoc.id,
      scheduleDate: new Date().toISOString(),
      notes: 'Automated Transfer Test',
    });

    if (!transRes.success || !transRes.data) throw new Error(`Transfer create failed: ${transRes.error}`);
    const transfer = transRes.data;

    await addInternalTransferLine(transfer.id, {
      productId: product.id,
      quantity: 30,
      sourceLocationId: stockLoc.id,
      destLocationId: prodLoc.id,
    });

    const valTransRes = await validateInternalTransfer(transfer.id);
    if (!valTransRes.success) throw new Error(`Transfer validation failed: ${valTransRes.error}`);

    const locStock = await getProductStockByLocation(product.id);
    results.transferFlow = {
      reference: transfer.reference,
      locations: locStock.data,
      totalStock: locStock.data?.reduce((sum, l) => sum + l.quantity, 0),
      expectedTotal: 100,
    };

    // 5. Delivery Flow (-20 units to Customer)
    log.push('5. Outbound Delivery Flow (20 units to Customer)...');
    const custRes = await getCustomers();
    const customer = custRes.data?.[0];

    const delRes = await createDelivery({
      contactId: customer?.id || null,
      sourceLocationId: prodLoc.id,
      scheduleDate: new Date().toISOString(),
      notes: 'Automated Delivery Test',
    });

    if (!delRes.success || !delRes.data) throw new Error(`Delivery create failed: ${delRes.error}`);
    const delivery = delRes.data;

    await addDeliveryLine(delivery.id, {
      productId: product.id,
      quantity: 20,
      sourceLocationId: prodLoc.id,
    });

    const valDelRes = await validateDelivery(delivery.id);
    if (!valDelRes.success) throw new Error(`Delivery validation failed: ${valDelRes.error}`);

    const stockAfterDel = await getProductStockQuantity(product.id);
    results.deliveryFlow = {
      reference: delivery.reference,
      stockAfterDelivery: stockAfterDel.data,
      expected: 80,
      passed: stockAfterDel.data === 80,
    };

    // 6. Stock Adjustment Flow (Counted 65 in Stock -> -5 adjustment)
    log.push('6. Physical Count Adjustment (Cycle Count write-off)...');
    const adjRes = await createStockAdjustment(product.id, stockLoc.id, 65, 'Cycle count audit');
    if (!adjRes.success) throw new Error(`Adjustment failed: ${adjRes.error}`);

    const finalStock = await getProductStockQuantity(product.id);
    results.adjustmentFlow = {
      message: adjRes.message,
      finalTotalStock: finalStock.data,
      expected: 75,
      passed: finalStock.data === 75,
    };

    // 7. Audit History
    const historyRes = await getProductMovementHistory(product.id, 10);
    results.auditTrail = {
      totalMoves: historyRes.data?.length || 0,
      entries: historyRes.data?.map((h) => ({
        doc: h.StockDocument?.reference || 'Direct',
        qty: h.quantity,
        from: h.source_location?.name || 'Vendor',
        to: h.destination_location?.name || 'Customer',
      })),
    };

    // 8. KPIs
    const kpiRes = await getDashboardKPIs();
    results.dashboardKPIs = kpiRes.data;

    return NextResponse.json({
      success: true,
      message: 'All End-to-End Inventory Flows Tested Successfully!',
      log,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      log,
    }, { status: 500 });
  }
}

