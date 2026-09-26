-- Seed Categories
INSERT INTO "Category" (name) VALUES
  ('Raw Materials'),
  ('Finished Goods'),
  ('Components'),
  ('Consumables'),
  ('Packaging')
ON CONFLICT (name) DO NOTHING;

-- Seed Units of Measure
INSERT INTO "UnitOfMeasure" (name, symbol) VALUES
  ('Units', 'pcs'),
  ('Kilograms', 'kg'),
  ('Liters', 'L'),
  ('Meters', 'm'),
  ('Box', 'box'),
  ('Carton', 'ctn')
ON CONFLICT (name) DO NOTHING;

-- Seed Warehouse
INSERT INTO "Warehouse" (name, "shortCode", address) VALUES
  ('Main Warehouse', 'WH', '123 Industrial Ave, Business District')
ON CONFLICT ("shortCode") DO NOTHING;

-- Seed Internal Locations and External Virtual Locations
DO $$
DECLARE
  wh_id TEXT;
BEGIN
  SELECT id INTO wh_id FROM "Warehouse" WHERE "shortCode" = 'WH' LIMIT 1;
  
  -- Seed Internal Locations
  INSERT INTO "Location" (name, "shortCode", type, "warehouseId") VALUES
    ('Stock', 'Stock', 'INTERNAL', wh_id),
    ('Production Floor', 'Prod', 'INTERNAL', wh_id),
    ('Packing Area', 'Pack', 'INTERNAL', wh_id),
    ('Quality Control', 'QC', 'INTERNAL', wh_id)
  ON CONFLICT ("warehouseId", "shortCode") DO NOTHING;
  
  -- Seed External Locations (Virtual)
  INSERT INTO "Location" (name, "shortCode", type, "warehouseId") VALUES
    ('Vendors', 'VENDOR', 'VENDOR', NULL),
    ('Customers', 'CUSTOMER', 'CUSTOMER', NULL)
  ON CONFLICT ("warehouseId", "shortCode") DO NOTHING;
END $$;

-- Seed Sample Contacts
INSERT INTO "Contact" (name, type, email, phone) VALUES
  ('ABC Suppliers Ltd', 'VENDOR', 'contact@abcsuppliers.com', '+1-555-0101'),
  ('XYZ Materials Inc', 'VENDOR', 'sales@xyzmaterials.com', '+1-555-0102'),
  ('Acme Corp', 'CUSTOMER', 'orders@acmecorp.com', '+1-555-0201'),
  ('Global Retail Co', 'CUSTOMER', 'purchasing@globalretail.com', '+1-555-0202')
ON CONFLICT DO NOTHING;
