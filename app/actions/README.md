# StockSense Backend APIs

This directory contains all server actions (backend APIs) for the StockSense inventory management system. All functions use Clerk authentication with Supabase RLS policies.

## 📁 File Structure

```
app/actions/
├── products.ts      # Product management APIs
├── receipts.ts      # Incoming stock (receipts) APIs
├── deliveries.ts    # Outgoing stock (deliveries) APIs
├── stock.ts         # Internal transfers, adjustments, history
├── dashboard.ts     # Dashboard KPIs and analytics
└── sync-user.ts     # User synchronization (Clerk → Supabase)
```

## 🔐 Authentication

All APIs use `createClerkSupabaseClientSsr()` which:
- Authenticates users via Clerk JWT tokens
- Enforces Row-Level Security (RLS) policies
- Automatically filters data based on user roles

## 📦 API Modules

### 1. Products API (`products.ts`)

Manage products, categories, and units of measure.

#### Product Operations
- `getProducts(filters?)` - List all products with optional filters
- `getProductById(productId)` - Get single product with stock quantity
- `createProduct(product)` - Create new product (validates SKU uniqueness)
- `updateProduct(productId, updates)` - Update product (draft only)
- `deleteProduct(productId)` - Delete/deactivate product (soft delete if has transactions)

#### Stock Queries
- `getProductStockQuantity(productId)` - Total stock across all locations
- `getProductStockByLocation(productId)` - Stock breakdown by location

#### Category & UOM
- `getCategories()` - List all categories
- `getUnitsOfMeasure()` - List all units of measure
- `createCategory(name, description?)` - Create new category
- `createUnitOfMeasure(name, abbreviation)` - Create new UOM

**Filters:**
```typescript
{
  category_id?: string;
  search?: string;          // Searches name and SKU
  is_active?: boolean;
  has_low_stock?: boolean;  // Filters by min_quantity threshold
}
```

---

### 2. Receipts API (`receipts.ts`)

Handle incoming stock from suppliers.

#### Document Operations
- `getReceipts(filters?)` - List all receipts with filters
- `getReceiptById(receiptId)` - Get single receipt with lines
- `createReceipt(receipt)` - Create draft receipt (auto-generates reference)
- `updateReceipt(receiptId, updates)` - Update receipt (draft only)
- `deleteReceipt(receiptId)` - Delete receipt (draft only)
- `cancelReceipt(receiptId)` - Cancel receipt

#### Line Operations
- `addReceiptLine(receiptId, line)` - Add product to receipt
- `updateReceiptLine(lineId, updates)` - Update line (draft only)
- `deleteReceiptLine(lineId)` - Remove line (draft only)

#### Validation
- `validateReceipt(receiptId)` - **Validate receipt → increases stock quantities**

#### Helpers
- `getSuppliers()` - List all supplier contacts

**Flow:**
1. Create receipt (draft)
2. Add product lines
3. Validate → stock increases automatically
4. Status changes: `draft` → `done`

---

### 3. Deliveries API (`deliveries.ts`)

Handle outgoing stock to customers.

#### Document Operations
- `getDeliveries(filters?)` - List all deliveries with filters
- `getDeliveryById(deliveryId)` - Get single delivery with lines
- `createDelivery(delivery)` - Create draft delivery (auto-generates reference)
- `updateDelivery(deliveryId, updates)` - Update delivery (draft only)
- `deleteDelivery(deliveryId)` - Delete delivery (draft only)
- `cancelDelivery(deliveryId)` - Cancel delivery

#### Line Operations
- `addDeliveryLine(deliveryId, line)` - Add product to delivery (checks stock availability)
- `updateDeliveryLine(lineId, updates)` - Update line (draft only, validates stock)
- `deleteDeliveryLine(lineId)` - Remove line (draft only)

#### Validation
- `validateDelivery(deliveryId)` - **Validate delivery → decreases stock quantities**

#### Helpers
- `getCustomers()` - List all customer contacts

**Flow:**
1. Create delivery (draft)
2. Add product lines (validates available stock)
3. Validate → stock decreases automatically
4. Status changes: `draft` → `done`

**Stock Validation:**
- Lines cannot be added if insufficient stock
- Validation fails if stock depleted between draft and validation

---

### 4. Stock API (`stock.ts`)

Internal transfers, adjustments, and movement history.

#### Internal Transfers
- `getInternalTransfers(filters?)` - List all transfers
- `createInternalTransfer(transfer)` - Create draft transfer
- `addInternalTransferLine(transferId, line)` - Add product to transfer (checks source stock)
- `validateInternalTransfer(transferId)` - **Move stock between locations**

**Flow:**
1. Create transfer with source/destination locations
2. Add product lines
3. Validate → decreases source, increases destination

#### Stock Adjustments
- `getStockAdjustments(filters?)` - List all adjustments
- `createStockAdjustment(productId, locationId, countedQuantity, notes?)` - Create adjustment
- `validateStockAdjustment(adjustmentId)` - Apply adjustment

**Flow:**
1. Physical count reveals discrepancy
2. Create adjustment with counted quantity
3. System calculates difference (counted - system)
4. Auto-validates and adjusts stock

#### Movement History
- `getProductMovementHistory(productId, limit?)` - Full audit trail for a product

#### Location Management
- `getWarehouses()` - List all warehouses
- `getLocations(warehouseId?)` - List locations (optionally filtered by warehouse)

---

### 5. Dashboard API (`dashboard.ts`)

Analytics and KPIs for dashboard view.

#### KPIs
- `getDashboardKPIs()` - Get all dashboard metrics:
  ```typescript
  {
    total_products: number;
    total_stock_items: number;
    low_stock_items: number;
    out_of_stock_items: number;
    pending_receipts: number;
    pending_deliveries: number;
    internal_transfers_scheduled: number;
  }
  ```

#### Alerts
- `getStockAlerts()` - List low stock, out of stock, and overstock products
- `getLowStockProducts()` - Detailed low stock product list with quantities

#### Analytics
- `getDocumentCountsByStatus()` - Document counts by type and status
- `getRecentStockMovements()` - Last 20 stock movements
- `getStockValueSummary()` - Total inventory value (requires cost fields)

---

## 🔄 Document Lifecycle

All stock documents (receipts, deliveries, transfers, adjustments) follow this lifecycle:

```
draft → [waiting] → [ready] → done
  ↓
canceled
```

**Status Definitions:**
- `draft` - Editable, can add/remove lines, can delete
- `waiting` - Pending approval or resources (optional)
- `ready` - Ready to validate (optional)
- `done` - Validated, stock updated, immutable
- `canceled` - Canceled, no stock impact

**Validation Rules:**
- Only `draft` documents can be edited
- Only `draft` documents can be validated
- Validated documents cannot be changed or deleted
- Validation triggers stock quantity updates

---

## 📊 Stock Movement Rules

### Receipt Validation
```
StockItem[product, destination_location].quantity += line.quantity
```

### Delivery Validation
```
StockItem[product, source_location].quantity -= line.quantity
```
- Fails if insufficient stock

### Internal Transfer Validation
```
StockItem[product, source_location].quantity -= line.quantity
StockItem[product, destination_location].quantity += line.quantity
```
- Fails if insufficient stock at source

### Stock Adjustment
```
difference = counted_quantity - current_quantity
if (difference > 0):
  StockItem[product, location].quantity += difference
else:
  StockItem[product, location].quantity -= abs(difference)
```

---

## 🎯 Common Patterns

### Creating a Receipt
```typescript
// 1. Create document
const receipt = await createReceipt({
  contact_id: supplierId,
  destination_location_id: warehouseLocationId,
  document_date: new Date().toISOString(),
  notes: 'Purchase order #12345',
});

// 2. Add products
await addReceiptLine(receipt.data.id, {
  product_id: productId,
  quantity: 100,
});

// 3. Validate (updates stock)
await validateReceipt(receipt.data.id);
```

### Creating a Delivery
```typescript
// 1. Create document
const delivery = await createDelivery({
  contact_id: customerId,
  source_location_id: warehouseLocationId,
  document_date: new Date().toISOString(),
  notes: 'Sales order #67890',
});

// 2. Add products (checks stock)
await addDeliveryLine(delivery.data.id, {
  product_id: productId,
  quantity: 50,
});

// 3. Validate (decreases stock)
await validateDelivery(delivery.data.id);
```

### Stock Adjustment
```typescript
// Physical count finds 95 units, system shows 100
await createStockAdjustment(
  productId,
  locationId,
  95, // counted quantity
  'Physical inventory count - Week 39'
);
// Automatically adjusts stock: 100 → 95
```

### Internal Transfer
```typescript
// 1. Create transfer
const transfer = await createInternalTransfer({
  source_location_id: mainWarehouseId,
  destination_location_id: productionFloorId,
  document_date: new Date().toISOString(),
  notes: 'Transfer to production',
});

// 2. Add products
await addInternalTransferLine(transfer.data.id, {
  product_id: productId,
  quantity: 25,
});

// 3. Validate (moves stock)
await validateInternalTransfer(transfer.data.id);
```

---

## 🚨 Error Handling

All APIs return a standardized response:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

**Example:**
```typescript
const result = await createProduct(productData);

if (!result.success) {
  console.error(result.error);
  // Show error to user
} else {
  console.log(result.message); // "Product created successfully"
  const product = result.data;
}
```

---

## 🔒 Security

- All APIs enforce RLS policies based on user roles
- SKU uniqueness validated on create/update
- Stock availability checked before delivery/transfer
- Draft-only edit restrictions enforced
- Soft delete for products with transaction history

---

## 🧪 Testing

To test APIs, create a simple test file:

```typescript
// app/test-apis.ts
import { getProducts, createProduct } from './actions/products';

async function test() {
  // Test product list
  const products = await getProducts();
  console.log('Products:', products);

  // Test product create
  const newProduct = await createProduct({
    name: 'Test Product',
    sku: 'TEST-001',
    category_id: 'some-category-id',
    uom_id: 'some-uom-id',
    min_quantity: 10,
  });
  console.log('Created:', newProduct);
}

test();
```

---

## 📝 Next Steps

Now that backend APIs are complete, you can:

1. Build UI components that consume these APIs
2. Create forms for CRUD operations
3. Build dashboard with KPI cards
4. Add real-time updates with Supabase subscriptions
5. Implement search and filter UIs

---

## 🤝 Contributing

When adding new APIs:
1. Use `'use server'` directive
2. Use `createClerkSupabaseClientSsr()` for auth
3. Return `ApiResponse<T>` type
4. Add error logging with `console.error`
5. Document in this README
