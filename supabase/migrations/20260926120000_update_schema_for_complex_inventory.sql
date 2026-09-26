-- Migration: Update schema to support complex inventory operations
-- This adds missing columns and improves the schema for production use

-- 1. Add description field to Category
ALTER TABLE "Category" 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Update Product table - add min/max quantity thresholds
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "minQuantity" INTEGER,
ADD COLUMN IF NOT EXISTS "maxQuantity" INTEGER;

-- 3. Rename StockItem.onHand to quantity for consistency
ALTER TABLE "StockItem"
RENAME COLUMN "onHand" TO quantity;

-- 4. Add source and destination location tracking to StockMoveLine
-- This allows line-level location tracking for complex scenarios
ALTER TABLE "StockMoveLine"
ADD COLUMN IF NOT EXISTS "sourceLocationId" TEXT,
ADD COLUMN IF NOT EXISTS "destLocationId" TEXT,
ADD CONSTRAINT "StockMoveLine_sourceLocationId_fkey" 
  FOREIGN KEY ("sourceLocationId") REFERENCES "Location"(id) ON DELETE RESTRICT,
ADD CONSTRAINT "StockMoveLine_destLocationId_fkey" 
  FOREIGN KEY ("destLocationId") REFERENCES "Location"(id) ON DELETE RESTRICT;

-- 5. Make StockDocument locations nullable (will inherit from lines if not set)
ALTER TABLE "StockDocument"
ALTER COLUMN "sourceLocationId" DROP NOT NULL,
ALTER COLUMN "destLocationId" DROP NOT NULL;

-- 6. Add validated_at timestamp to track when documents were validated
ALTER TABLE "StockDocument"
ADD COLUMN IF NOT EXISTS "validatedAt" TIMESTAMP(3);

-- 7. Update Contact to use snake_case enum values for consistency
-- First, create new enum with snake_case
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_type') THEN
    CREATE TYPE contact_type AS ENUM ('supplier', 'customer');
  END IF;
END $$;

-- 8. Add abbreviation field to UnitOfMeasure
ALTER TABLE "UnitOfMeasure"
ADD COLUMN IF NOT EXISTS abbreviation TEXT;

-- Update existing records to have abbreviation = symbol
UPDATE "UnitOfMeasure" SET abbreviation = symbol WHERE abbreviation IS NULL;

-- 9. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_moveline_source_location ON "StockMoveLine"("sourceLocationId");
CREATE INDEX IF NOT EXISTS idx_moveline_dest_location ON "StockMoveLine"("destLocationId");
CREATE INDEX IF NOT EXISTS idx_product_min_qty ON "Product"("minQuantity");
CREATE INDEX IF NOT EXISTS idx_stockdoc_validated ON "StockDocument"("validatedAt");

-- 10. Add comment/documentation
COMMENT ON COLUMN "Product"."minQuantity" IS 'Minimum stock threshold for low stock alerts';
COMMENT ON COLUMN "Product"."maxQuantity" IS 'Maximum stock threshold for overstock alerts';
COMMENT ON COLUMN "StockItem".quantity IS 'Current available quantity at this location';
COMMENT ON COLUMN "StockMoveLine"."sourceLocationId" IS 'Source location for this move line (overrides document-level if set)';
COMMENT ON COLUMN "StockMoveLine"."destLocationId" IS 'Destination location for this move line (overrides document-level if set)';
COMMENT ON COLUMN "StockDocument"."validatedAt" IS 'Timestamp when document was validated and stock was updated';

-- 11. Update the trigger function name for clarity
COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updatedAt timestamp on StockItem changes';
