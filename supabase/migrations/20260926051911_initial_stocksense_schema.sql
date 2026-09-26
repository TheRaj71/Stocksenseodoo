-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE "Role" AS ENUM ('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF');
CREATE TYPE "LocationType" AS ENUM ('INTERNAL', 'VENDOR', 'CUSTOMER');
CREATE TYPE "ContactType" AS ENUM ('VENDOR', 'CUSTOMER');
CREATE TYPE "DocumentType" AS ENUM ('RECEIPT', 'DELIVERY', 'INTERNAL_TRANSFER', 'ADJUSTMENT');
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED');

-- Create User table
CREATE TABLE "User" (
  id TEXT PRIMARY KEY DEFAULT ('usr_' || gen_random_uuid()::text),
  "clerkId" TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role "Role" NOT NULL DEFAULT 'WAREHOUSE_STAFF',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Warehouse table
CREATE TABLE "Warehouse" (
  id TEXT PRIMARY KEY DEFAULT ('wh_' || gen_random_uuid()::text),
  name TEXT NOT NULL,
  "shortCode" TEXT UNIQUE NOT NULL,
  address TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Location table
CREATE TABLE "Location" (
  id TEXT PRIMARY KEY DEFAULT ('loc_' || gen_random_uuid()::text),
  name TEXT NOT NULL,
  "shortCode" TEXT NOT NULL,
  type "LocationType" NOT NULL DEFAULT 'INTERNAL',
  "warehouseId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"(id) ON DELETE SET NULL,
  UNIQUE ("warehouseId", "shortCode")
);

-- Create Contact table
CREATE TABLE "Contact" (
  id TEXT PRIMARY KEY DEFAULT ('cnt_' || gen_random_uuid()::text),
  name TEXT NOT NULL,
  type "ContactType" NOT NULL,
  email TEXT,
  phone TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Category table
CREATE TABLE "Category" (
  id TEXT PRIMARY KEY DEFAULT ('cat_' || gen_random_uuid()::text),
  name TEXT UNIQUE NOT NULL
);

-- Create UnitOfMeasure table
CREATE TABLE "UnitOfMeasure" (
  id TEXT PRIMARY KEY DEFAULT ('uom_' || gen_random_uuid()::text),
  name TEXT UNIQUE NOT NULL,
  symbol TEXT NOT NULL
);

-- Create Product table
CREATE TABLE "Product" (
  id TEXT PRIMARY KEY DEFAULT ('prd_' || gen_random_uuid()::text),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  "categoryId" TEXT NOT NULL,
  "uomId" TEXT NOT NULL,
  "unitCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "reorderPoint" INTEGER NOT NULL DEFAULT 0,
  "reorderQty" INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("categoryId") REFERENCES "Category"(id) ON DELETE RESTRICT,
  FOREIGN KEY ("uomId") REFERENCES "UnitOfMeasure"(id) ON DELETE RESTRICT
);

-- Create StockItem table
CREATE TABLE "StockItem" (
  id TEXT PRIMARY KEY DEFAULT ('sti_' || gen_random_uuid()::text),
  "productId" TEXT NOT NULL,
  "locationId" TEXT NOT NULL,
  "onHand" INTEGER NOT NULL DEFAULT 0,
  reserved INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE,
  FOREIGN KEY ("locationId") REFERENCES "Location"(id) ON DELETE CASCADE,
  UNIQUE ("productId", "locationId")
);

-- Create StockDocument table
CREATE TABLE "StockDocument" (
  id TEXT PRIMARY KEY DEFAULT ('doc_' || gen_random_uuid()::text),
  reference TEXT UNIQUE NOT NULL,
  type "DocumentType" NOT NULL,
  "contactId" TEXT,
  "sourceLocationId" TEXT NOT NULL,
  "destLocationId" TEXT NOT NULL,
  "scheduleDate" TIMESTAMP(3) NOT NULL,
  "doneDate" TIMESTAMP(3),
  status "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
  "responsibleId" TEXT,
  "operationType" TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("contactId") REFERENCES "Contact"(id) ON DELETE SET NULL,
  FOREIGN KEY ("sourceLocationId") REFERENCES "Location"(id) ON DELETE RESTRICT,
  FOREIGN KEY ("destLocationId") REFERENCES "Location"(id) ON DELETE RESTRICT,
  FOREIGN KEY ("responsibleId") REFERENCES "User"(id) ON DELETE SET NULL
);

-- Create StockMoveLine table
CREATE TABLE "StockMoveLine" (
  id TEXT PRIMARY KEY DEFAULT ('mvl_' || gen_random_uuid()::text),
  "documentId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("documentId") REFERENCES "StockDocument"(id) ON DELETE CASCADE,
  FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE RESTRICT
);

-- Create indexes for better query performance
CREATE INDEX idx_user_clerk_id ON "User"("clerkId");
CREATE INDEX idx_location_warehouse ON "Location"("warehouseId");
CREATE INDEX idx_location_type ON "Location"(type);
CREATE INDEX idx_product_category ON "Product"("categoryId");
CREATE INDEX idx_product_sku ON "Product"(sku);
CREATE INDEX idx_product_active ON "Product"(active);
CREATE INDEX idx_stockitem_product ON "StockItem"("productId");
CREATE INDEX idx_stockitem_location ON "StockItem"("locationId");
CREATE INDEX idx_stockdoc_type ON "StockDocument"(type);
CREATE INDEX idx_stockdoc_status ON "StockDocument"(status);
CREATE INDEX idx_stockdoc_schedule ON "StockDocument"("scheduleDate");
CREATE INDEX idx_stockdoc_reference ON "StockDocument"(reference);
CREATE INDEX idx_moveline_document ON "StockMoveLine"("documentId");
CREATE INDEX idx_moveline_product ON "StockMoveLine"("productId");

-- Create trigger to update updatedAt on StockItem
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stockitem_updated_at BEFORE UPDATE ON "StockItem"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
