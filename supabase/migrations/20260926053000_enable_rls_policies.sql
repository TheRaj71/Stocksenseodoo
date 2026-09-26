-- Enable Row Level Security on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Warehouse" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UnitOfMeasure" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockMoveLine" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- User Table Policies
-- ============================================================================

-- Users can read their own record
CREATE POLICY "Users can read own record"
ON "User"
FOR SELECT
TO authenticated
USING ("clerkId" = (auth.jwt() ->> 'sub'));

-- Allow system to create users (for first-time login sync)
CREATE POLICY "System can create users"
ON "User"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update their own record
CREATE POLICY "Users can update own record"
ON "User"
FOR UPDATE
TO authenticated
USING ("clerkId" = (auth.jwt() ->> 'sub'));

-- Admins can read all users
CREATE POLICY "Admins can read all users"
ON "User"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "clerkId" = (auth.jwt() ->> 'sub')
    AND role = 'ADMIN'
  )
);

-- ============================================================================
-- Warehouse & Location Policies (Organization-wide read, managers can write)
-- ============================================================================

-- All authenticated users can read warehouses
CREATE POLICY "Authenticated users can read warehouses"
ON "Warehouse"
FOR SELECT
TO authenticated
USING (true);

-- Only ADMIN and INVENTORY_MANAGER can manage warehouses
CREATE POLICY "Managers can manage warehouses"
ON "Warehouse"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "clerkId" = (auth.jwt() ->> 'sub')
    AND role IN ('ADMIN', 'INVENTORY_MANAGER')
  )
);

-- All authenticated users can read locations
CREATE POLICY "Authenticated users can read locations"
ON "Location"
FOR SELECT
TO authenticated
USING (true);

-- Only ADMIN and INVENTORY_MANAGER can manage locations
CREATE POLICY "Managers can manage locations"
ON "Location"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "clerkId" = (auth.jwt() ->> 'sub')
    AND role IN ('ADMIN', 'INVENTORY_MANAGER')
  )
);

-- ============================================================================
-- Contact Policies
-- ============================================================================

-- All authenticated users can read contacts
CREATE POLICY "Authenticated users can read contacts"
ON "Contact"
FOR SELECT
TO authenticated
USING (true);

-- Only ADMIN and INVENTORY_MANAGER can manage contacts
CREATE POLICY "Managers can manage contacts"
ON "Contact"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "clerkId" = (auth.jwt() ->> 'sub')
    AND role IN ('ADMIN', 'INVENTORY_MANAGER')
  )
);

-- ============================================================================
-- Category & UnitOfMeasure Policies (Read-only for staff, managers can write)
-- ============================================================================

-- All authenticated users can read categories
CREATE POLICY "Authenticated users can read categories"
ON "Category"
FOR SELECT
TO authenticated
USING (true);

-- Only ADMIN and INVENTORY_MANAGER can manage categories
CREATE POLICY "Managers can manage categories"
ON "Category"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "clerkId" = (auth.jwt() ->> 'sub')
    AND role IN ('ADMIN', 'INVENTORY_MANAGER')
  )
);

-- All authenticated users can read UOMs
CREATE POLICY "Authenticated users can read uoms"
ON "UnitOfMeasure"
FOR SELECT
TO authenticated
USING (true);

-- Only ADMIN and INVENTORY_MANAGER can manage UOMs
CREATE POLICY "Managers can manage uoms"
ON "UnitOfMeasure"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "clerkId" = (auth.jwt() ->> 'sub')
    AND role IN ('ADMIN', 'INVENTORY_MANAGER')
  )
);

-- ============================================================================
-- Product Policies
-- ============================================================================

-- All authenticated users can read products
CREATE POLICY "Authenticated users can read products"
ON "Product"
FOR SELECT
TO authenticated
USING (true);

-- Only ADMIN and INVENTORY_MANAGER can create/update/delete products
CREATE POLICY "Managers can manage products"
ON "Product"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "clerkId" = (auth.jwt() ->> 'sub')
    AND role IN ('ADMIN', 'INVENTORY_MANAGER')
  )
);

-- ============================================================================
-- StockItem Policies (Read for all, system updates only)
-- ============================================================================

-- All authenticated users can read stock items
CREATE POLICY "Authenticated users can read stock items"
ON "StockItem"
FOR SELECT
TO authenticated
USING (true);

-- Only managers can directly update stock items (for manual corrections)
CREATE POLICY "Managers can update stock items"
ON "StockItem"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "clerkId" = (auth.jwt() ->> 'sub')
    AND role IN ('ADMIN', 'INVENTORY_MANAGER')
  )
);

-- ============================================================================
-- StockDocument Policies
-- ============================================================================

-- All authenticated users can read stock documents
CREATE POLICY "Authenticated users can read documents"
ON "StockDocument"
FOR SELECT
TO authenticated
USING (true);

-- All authenticated users can create documents
CREATE POLICY "Authenticated users can create documents"
ON "StockDocument"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update documents they're responsible for if status is DRAFT
CREATE POLICY "Users can update own draft documents"
ON "StockDocument"
FOR UPDATE
TO authenticated
USING (
  "responsibleId" IN (
    SELECT id FROM "User" WHERE "clerkId" = (auth.jwt() ->> 'sub')
  )
  AND status = 'DRAFT'
);

-- Managers can update any document
CREATE POLICY "Managers can update any document"
ON "StockDocument"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "clerkId" = (auth.jwt() ->> 'sub')
    AND role IN ('ADMIN', 'INVENTORY_MANAGER')
  )
);

-- Only managers can delete documents
CREATE POLICY "Managers can delete documents"
ON "StockDocument"
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "clerkId" = (auth.jwt() ->> 'sub')
    AND role IN ('ADMIN', 'INVENTORY_MANAGER')
  )
);

-- ============================================================================
-- StockMoveLine Policies (Tied to parent document)
-- ============================================================================

-- All authenticated users can read move lines
CREATE POLICY "Authenticated users can read move lines"
ON "StockMoveLine"
FOR SELECT
TO authenticated
USING (true);

-- Users can insert move lines for documents they can create
CREATE POLICY "Authenticated users can create move lines"
ON "StockMoveLine"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update move lines for their draft documents
CREATE POLICY "Users can update own draft move lines"
ON "StockMoveLine"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "StockDocument" sd
    INNER JOIN "User" u ON sd."responsibleId" = u.id
    WHERE sd.id = "StockMoveLine"."documentId"
    AND u."clerkId" = (auth.jwt() ->> 'sub')
    AND sd.status = 'DRAFT'
  )
);

-- Managers can update any move lines
CREATE POLICY "Managers can update any move lines"
ON "StockMoveLine"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "clerkId" = (auth.jwt() ->> 'sub')
    AND role IN ('ADMIN', 'INVENTORY_MANAGER')
  )
);

-- Only managers can delete move lines
CREATE POLICY "Managers can delete move lines"
ON "StockMoveLine"
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "clerkId" = (auth.jwt() ->> 'sub')
    AND role IN ('ADMIN', 'INVENTORY_MANAGER')
  )
);
