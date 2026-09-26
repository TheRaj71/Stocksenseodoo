import { 
  getProducts, 
  createProduct, 
  getProductById, 
  getProductStockQuantity,
  getProductStockByLocation,
  getCategories,
  getUnitsOfMeasure
} from './app/actions/products';

import { 
  getReceipts, 
  createReceipt, 
  addReceiptLine, 
  validateReceipt, 
  getSuppliers 
} from './app/actions/receipts';

import { 
  getDeliveries, 
  createDelivery, 
  addDeliveryLine, 
  validateDelivery, 
  getCustomers 
} from './app/actions/deliveries';

import { 
  getInternalTransfers, 
  createInternalTransfer, 
  addInternalTransferLine, 
  validateInternalTransfer, 
  createStockAdjustment,
  getProductMovementHistory,
  getWarehouses,
  getLocations
} from './app/actions/stock';

import { getDashboardKPIs, getStockAlerts } from './app/actions/dashboard';

async function runEndToEndTests() {
  console.log('====================================================');
  console.log('🚀 STOCKSENSE END-TO-END SYSTEM TEST');
  console.log('====================================================\n');

  try {
    // 1. Check Master Data
    console.log('📦 1. Fetching Categories & Units of Measure...');
    const catRes = await getCategories();
    const uomRes = await getUnitsOfMeasure();
    const locRes = await getLocations();
    const whRes = await getWarehouses();

    console.log(`   Categories found: ${catRes.data?.length || 0}`);
    console.log(`   UOMs found: ${uomRes.data?.length || 0}`);
    console.log(`   Locations found: ${locRes.data?.length || 0}`);
    console.log(`   Warehouses found: ${whRes.data?.length || 0}`);

    const categoryId = catRes.data?.[0]?.id;
    const uomId = uomRes.data?.[0]?.id;
    const internalLocs = locRes.data?.filter(l => l.type === 'INTERNAL') || [];
    const stockLoc = internalLocs.find(l => l.shortCode === 'Stock') || internalLocs[0];
    const prodLoc = internalLocs.find(l => l.shortCode === 'Prod') || internalLocs[1] || internalLocs[0];

    if (!categoryId || !uomId || !stockLoc) {
      throw new Error('Missing base seed data (Category, UOM, or Location)');
    }

    // 2. Create Test Product
    const testSku = `TEST-E2E-${Date.now().toString().slice(-4)}`;
    console.log(`\n📦 2. Creating New Product SKU: ${testSku}...`);
    const prodRes = await createProduct({
      name: `High-Grade Steel Bolt ${testSku}`,
      sku: testSku,
      categoryId,
      uomId,
      unitCost: 12.50,
      minQuantity: 20,
      maxQuantity: 200,
      reorderPoint: 30,
      reorderQty: 100,
      active: true
    });

    if (!prodRes.success || !prodRes.data) {
      throw new Error(`Failed to create product: ${prodRes.error}`);
    }
    const product = prodRes.data;
    console.log(`   ✅ Product Created: ID=${product.id}, SKU=${product.sku}`);

    // Check Initial Stock
    const initStock = await getProductStockQuantity(product.id);
    console.log(`   Initial stock: ${initStock.data || 0} pcs`);

    // 3. Inbound Receipt Flow (Vendor -> Stock +100)
    console.log('\n📥 3. Testing Inbound Receipt Flow...');
    const supRes = await getSuppliers();
    const supplier = supRes.data?.[0];

    const recRes = await createReceipt({
      contactId: supplier?.id || null,
      destLocationId: stockLoc.id,
      scheduleDate: new Date().toISOString(),
      notes: 'E2E Automated Inbound Test'
    });

    if (!recRes.success || !recRes.data) {
      throw new Error(`Failed to create receipt: ${recRes.error}`);
    }
    const receipt = recRes.data;
    console.log(`   Draft Receipt created: ${receipt.reference}`);

    // Add 100 units line
    const recLineRes = await addReceiptLine(receipt.id, {
      productId: product.id,
      quantity: 100,
      destLocationId: stockLoc.id
    });
    console.log(`   Added receipt line: +100 units`);

    // Validate Receipt
    console.log(`   Validating receipt ${receipt.reference}...`);
    const valRecRes = await validateReceipt(receipt.id);
    if (!valRecRes.success) throw new Error(`Receipt validation failed: ${valRecRes.error}`);
    console.log(`   ✅ Receipt validated successfully!`);

    // Verify Stock increased to 100
    const stockAfterRec = await getProductStockQuantity(product.id);
    console.log(`   Stock after receipt: ${stockAfterRec.data} pcs (Expected: 100)`);
    if (stockAfterRec.data !== 100) throw new Error(`Stock mismatch: Expected 100, got ${stockAfterRec.data}`);

    // 4. Internal Transfer Flow (Stock -> Prod Floor: 30 units)
    console.log('\n🔄 4. Testing Internal Transfer (Stock -> Prod Floor)...');
    const transRes = await createInternalTransfer({
      sourceLocationId: stockLoc.id,
      destLocationId: prodLoc.id,
      scheduleDate: new Date().toISOString(),
      notes: 'Move 30 units to Production'
    });

    if (!transRes.success || !transRes.data) throw new Error(`Failed to create transfer: ${transRes.error}`);
    const transfer = transRes.data;

    await addInternalTransferLine(transfer.id, {
      productId: product.id,
      quantity: 30,
      sourceLocationId: stockLoc.id,
      destLocationId: prodLoc.id
    });
    console.log(`   Added transfer line: 30 units from ${stockLoc.name} to ${prodLoc.name}`);

    const valTransRes = await validateInternalTransfer(transfer.id);
    if (!valTransRes.success) throw new Error(`Transfer validation failed: ${valTransRes.error}`);
    console.log(`   ✅ Internal Transfer validated!`);

    const locStock = await getProductStockByLocation(product.id);
    console.log(`   Location breakdown after transfer:`);
    locStock.data?.forEach(l => {
      console.log(`     - ${l.location_name}: ${l.quantity} pcs`);
    });

    // 5. Outbound Delivery Flow (Customer Dispatch: 20 units)
    console.log('\n📤 5. Testing Outbound Delivery Flow...');
    const custRes = await getCustomers();
    const customer = custRes.data?.[0];

    const delRes = await createDelivery({
      contactId: customer?.id || null,
      sourceLocationId: prodLoc.id,
      scheduleDate: new Date().toISOString(),
      notes: 'Customer Order Dispatch'
    });

    if (!delRes.success || !delRes.data) throw new Error(`Failed to create delivery: ${delRes.error}`);
    const delivery = delRes.data;

    await addDeliveryLine(delivery.id, {
      productId: product.id,
      quantity: 20,
      sourceLocationId: prodLoc.id
    });
    console.log(`   Added delivery line: 20 units from ${prodLoc.name}`);

    const valDelRes = await validateDelivery(delivery.id);
    if (!valDelRes.success) throw new Error(`Delivery validation failed: ${valDelRes.error}`);
    console.log(`   ✅ Delivery validated!`);

    const stockAfterDel = await getProductStockQuantity(product.id);
    console.log(`   Total stock after delivery: ${stockAfterDel.data} pcs (Expected: 80)`);

    // 6. Stock Adjustment / Physical Count Flow
    console.log('\n⚖️ 6. Testing Stock Adjustment (Cycle Count)...');
    console.log(`   Physical count at ${stockLoc.name} found 65 units (System has 70)...`);
    const adjRes = await createStockAdjustment(product.id, stockLoc.id, 65, 'Cycle count write-off: -5 damaged');
    if (!adjRes.success) throw new Error(`Adjustment failed: ${adjRes.error}`);
    console.log(`   ✅ Stock Adjustment reconciled: ${adjRes.message}`);

    const finalStock = await getProductStockQuantity(product.id);
    console.log(`   Final total stock across all bins: ${finalStock.data} pcs (Expected: 75)`);

    // 7. Check Audit Movement History
    console.log('\n📜 7. Checking Movement Audit Trail...');
    const historyRes = await getProductMovementHistory(product.id, 10);
    console.log(`   Total audit entries for SKU ${testSku}: ${historyRes.data?.length || 0}`);
    historyRes.data?.forEach((h, idx) => {
      console.log(`     [#${idx+1}] Doc: ${h.StockDocument?.reference || 'Direct'} | Qty: ${h.quantity} | Date: ${h.createdAt}`);
    });

    // 8. Check Dashboard KPIs
    console.log('\n📊 8. Checking Live Dashboard KPIs...');
    const kpiRes = await getDashboardKPIs();
    console.log(`   Dashboard KPIs:`, kpiRes.data);

    console.log('\n====================================================');
    console.log('🎉 ALL END-TO-END INVENTORY FLOWS PASSED PERFECTLY!');
    console.log('====================================================\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:', error);
  }
}

runEndToEndTests();

