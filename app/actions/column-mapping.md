# Database Column Mapping

## Actual Database Schema (camelCase)

### Product
- id
- name
- sku
- categoryId (NOT category_id)
- uomId (NOT uom_id)
- unitCost
- reorderPoint
- reorderQty
- minQuantity (NEW)
- maxQuantity (NEW)
- active (NOT is_active)
- createdAt

### StockDocument
- id
- reference
- type (NOT document_type)
- contactId (NOT contact_id)
- sourceLocationId (NOT source_location_id) - NULLABLE
- destLocationId (NOT destination_location_id) - NULLABLE
- scheduleDate (NOT document_date)
- doneDate
- status
- responsibleId
- operationType
- notes
- createdAt
- validatedAt (NEW)

### StockMoveLine
- id
- documentId (NOT document_id)
- productId (NOT product_id)
- quantity
- sourceLocationId (NEW) - NULLABLE
- destLocationId (NEW) - NULLABLE
- createdAt

### StockItem
- id
- productId (NOT product_id)
- locationId (NOT location_id)
- quantity (NOT onHand)
- reserved
- updatedAt

### Contact
- id
- name
- type (NOT contact_type)
- email
- phone
- createdAt

### Category
- id
- name
- description (NEW)

### UnitOfMeasure
- id
- name
- symbol
- abbreviation (NEW)

### Location
- id
- name
- shortCode
- type
- warehouseId (NOT warehouse_id)
- createdAt

### Warehouse
- id
- name
- shortCode
- address
- createdAt

## Enum Values (UPPERCASE)

### DocumentType
- "RECEIPT" (not "receipt")
- "DELIVERY" (not "delivery")
- "INTERNAL_TRANSFER" (not "internal")
- "ADJUSTMENT" (not "adjustment")

### DocumentStatus
- "DRAFT" (not "draft")
- "WAITING" (not "waiting")
- "READY" (not "ready")
- "DONE" (not "done")
- "CANCELLED" (not "canceled")

### ContactType
- "VENDOR" (not "supplier")
- "CUSTOMER" (not "customer")

Note: There's also a snake_case enum `contact_type` with values "supplier"/"customer" but we should use ContactType with VENDOR/CUSTOMER

### Role
- "ADMIN"
- "INVENTORY_MANAGER"
- "WAREHOUSE_STAFF"

### LocationType
- "INTERNAL"
- "VENDOR"
- "CUSTOMER"
