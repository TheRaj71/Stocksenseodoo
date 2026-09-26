# StockSense Database Migrations

This folder contains all database migrations for the StockSense inventory management system.

## 🗂️ Migration Files

### 1. `20260926051911_initial_stocksense_schema.sql`
Creates the complete database schema with:
- 10 tables: User, Warehouse, Location, Contact, Category, UnitOfMeasure, Product, StockItem, StockDocument, StockMoveLine
- 5 ENUM types: Role, LocationType, ContactType, DocumentType, DocumentStatus
- All foreign key relationships
- Performance indexes
- Triggers for auto-updating timestamps

### 2. `20260926052000_seed_initial_data.sql`
Seeds essential starting data:
- 5 Categories (Raw Materials, Finished Goods, Components, Consumables, Packaging)
- 6 Units of Measure (pcs, kg, L, m, box, ctn)
- 1 Main Warehouse with 4 internal locations
- 2 Virtual external locations (Vendors, Customers)
- 4 Sample contacts (2 vendors, 2 customers)

### 3. `20260926053000_enable_rls_policies.sql`
Enables Row Level Security with comprehensive policies:
- **Read Access**: All authenticated users can read most data
- **Write Access**: Only ADMIN and INVENTORY_MANAGER can manage master data (products, categories, etc.)
- **Document Management**: Users can create documents, update their own drafts, managers can update any
- **Security**: Clerk JWT integration for authentication

## 🚀 How to Use These Migrations

### For New Database Setup (Production/Staging)

If you're setting up a fresh StockSense instance:

```bash
# 1. Make sure you have Supabase CLI installed
# https://supabase.com/docs/guides/cli

# 2. Link to your project
supabase link --project-ref your-project-ref

# 3. Apply all migrations
supabase db push

# Or apply them one by one
supabase db execute --file supabase/migrations/20260926051911_initial_stocksense_schema.sql
supabase db execute --file supabase/migrations/20260926052000_seed_initial_data.sql
supabase db execute --file supabase/migrations/20260926053000_enable_rls_policies.sql
```

### For Local Development

```bash
# 1. Start local Supabase
supabase start

# 2. Migrations are automatically applied to local instance
# Access local studio at: http://localhost:54323
```

### Creating New Migrations

```bash
# Create a new migration file
supabase migration new your_migration_name

# This creates a timestamped file in supabase/migrations/
# Edit the file and add your SQL

# Apply the new migration
supabase db push
```

## 🔐 Row Level Security (RLS) Policies

All tables have RLS enabled with these rules:

### User Roles:
- **ADMIN**: Full access to everything
- **INVENTORY_MANAGER**: Can manage products, documents, and master data
- **WAREHOUSE_STAFF**: Can read all data, create/update their own documents

### Policy Summary:

| Table | Read | Create | Update | Delete |
|-------|------|--------|--------|--------|
| User | Own record + Admins see all | System auto-creates | Own record | Admins only |
| Warehouse | All authenticated | Managers only | Managers only | Managers only |
| Location | All authenticated | Managers only | Managers only | Managers only |
| Contact | All authenticated | Managers only | Managers only | Managers only |
| Category | All authenticated | Managers only | Managers only | Managers only |
| UnitOfMeasure | All authenticated | Managers only | Managers only | Managers only |
| Product | All authenticated | Managers only | Managers only | Managers only |
| StockItem | All authenticated | Managers only | Managers only | Managers only |
| StockDocument | All authenticated | All authenticated | Own drafts + Managers any | Managers only |
| StockMoveLine | All authenticated | All authenticated | Own drafts + Managers any | Managers only |

## 📊 Database Schema Overview

```
┌─────────────┐       ┌──────────────┐
│   User      │       │  Warehouse   │
│ (Clerk sync)│       └──────┬───────┘
└──────┬──────┘              │
       │              ┌──────▼────────┐
       │              │   Location    │
       │              └───────────────┘
       │                      │
┌──────▼──────────────────────▼────────┐
│         StockDocument                │
│  (Receipts, Deliveries, Transfers)   │
└──────────────┬───────────────────────┘
               │
      ┌────────▼──────────┐
      │  StockMoveLine    │
      │  (Audit Trail)    │
      └───────────────────┘

┌──────────┐      ┌─────────────┐
│ Category │──┐   │ UnitOfMeasure│
└──────────┘  │   └──────┬──────┘
              │          │
         ┌────▼──────────▼────┐
         │     Product        │
         └────────┬───────────┘
                  │
         ┌────────▼───────────┐
         │    StockItem       │
         │ (Cached Quantities)│
         └────────────────────┘
```

## 🔧 Maintenance

### Check Migration Status
```bash
supabase migration list
```

### Rollback Last Migration (Caution!)
```bash
# Not recommended in production
# Create a new migration to revert changes instead
```

### Backup Before Major Changes
```bash
# Always backup before applying migrations to production
supabase db dump -f backup.sql
```

## 📝 Notes

- Migrations are applied in order by timestamp
- Once applied to production, never modify existing migration files
- Create new migrations for schema changes
- Test migrations locally before applying to production
- The seed data migration is idempotent (safe to run multiple times)
