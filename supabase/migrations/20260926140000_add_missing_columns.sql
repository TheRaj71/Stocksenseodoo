-- Migration: Add missing columns for complete inventory management
-- Description: Adds barcode, capacity, active flags, and supplier relationships

-- Add columns to Location table
ALTER TABLE "Location" 
  ADD COLUMN IF NOT EXISTS "barcode" TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "capacity" INTEGER,
  ADD COLUMN IF NOT EXISTS "active" BOOLEAN DEFAULT true NOT NULL;

-- Create index on location barcode for fast scanning lookups
CREATE INDEX IF NOT EXISTS "idx_location_barcode" ON "Location"("barcode") WHERE "barcode" IS NOT NULL;

-- Add columns to Product table
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "preferredSupplierId" TEXT REFERENCES "Contact"("id") ON DELETE SET NULL;

-- Create index on preferred supplier for reordering queries
CREATE INDEX IF NOT EXISTS "idx_product_preferred_supplier" ON "Product"("preferredSupplierId") WHERE "preferredSupplierId" IS NOT NULL;

-- Add active column to Contact table
ALTER TABLE "Contact"
  ADD COLUMN IF NOT EXISTS "active" BOOLEAN DEFAULT true NOT NULL;

-- Create index for active contacts queries
CREATE INDEX IF NOT EXISTS "idx_contact_active" ON "Contact"("active");

-- Add comments for documentation
COMMENT ON COLUMN "Location"."barcode" IS 'Unique barcode for location scanning during warehouse operations';
COMMENT ON COLUMN "Location"."capacity" IS 'Maximum quantity capacity for this location (NULL = unlimited)';
COMMENT ON COLUMN "Location"."active" IS 'Whether this location is currently active and available for use';
COMMENT ON COLUMN "Product"."preferredSupplierId" IS 'Reference to the preferred supplier/vendor for automatic reordering';
COMMENT ON COLUMN "Contact"."active" IS 'Whether this contact is currently active';

-- Update existing records to set active = true if NULL
UPDATE "Location" SET "active" = true WHERE "active" IS NULL;
UPDATE "Contact" SET "active" = true WHERE "active" IS NULL;
