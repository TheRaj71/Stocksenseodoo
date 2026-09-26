# 📦 StockSense — Warehouse & Inventory Management System (IMS)

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-emerald?logo=supabase)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF?logo=clerk)](https://clerk.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**StockSense** is a high-throughput, modular Inventory Management System (IMS) engineered to digitize and streamline warehouse operations. Built to replace manual registers, error-prone spreadsheets, and fragmented tracking tools, StockSense provides inventory managers and warehouse picking/shelving staff with a centralized, real-time, industrial-grade ops console.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER (Next.js 16 + React 19)              │
│  • AppShell & Multi-Warehouse Selector                                  │
│  • Barcode & SKU Quick Command Palette (Ctrl+K / '/')                   │
│  • Operations Dashboard & Real-Time Throughput Visualizations           │
│  • Product Catalog with Location Stock Drawers & Progress Bars          │
│  • Receipts, Deliveries, Transfers, Cycle Count Adjustments, Ledger     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Server Actions ('use server')
┌────────────────────────────────────▼────────────────────────────────────┐
│                      BACKEND SERVER ACTIONS LAYER                       │
│  • app/actions/products.ts     (Catalog CRUD & Location Balances)       │
│  • app/actions/receipts.ts     (Inbound Shipments & Validation)         │
│  • app/actions/deliveries.ts   (Outbound Shipments & Sufficiency Check) │
│  • app/actions/stock.ts        (Bin Transfers & Cycle Count Adjustments)│
│  • app/actions/dashboard.ts    (Real-Time KPIs & Movement Audits)       │
│  • app/actions/sync-user.ts    (Clerk Identity to PostgreSQL Sync)      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ PostgreSQL RLS + Clerk JWT
┌────────────────────────────────────▼────────────────────────────────────┐
│                      DATABASE LAYER (Supabase PostgreSQL)               │
│  • 10 Core Tables (Product, StockItem, StockDocument, StockMoveLine...) │
│  • Row-Level Security (RLS) & Role Permissions Matrix                   │
│  • Automated Update Triggers & Sequential Reference Generators          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Core Operational Features

### 1. Master Catalog & Location Stock Tracking
- **SKU Management**: Unique alphanumeric SKU codes with category classification, unit costs, and unit of measure (UOM).
- **Per-Location Stock Breakdown**: Inspect on-hand quantities across specific physical locations (`WH/Stock`, `WH/Production Floor`, `WH/Packing Area`, `WH/QC`).
- **Automated Thresholds**: Set minimum and maximum reorder points with color-coded stock progress bars and low-stock alerts.

### 2. Inbound Goods Receipts (`REC-YYYYMMDD-XXXXX`)
- Record vendor shipments against purchase orders.
- Add product lines with projected $+ \Delta$ stock impact previews.
- **One-Click Validation**: Atomically updates `StockItem` balances, transitions document to `DONE`, and stamps audit logs.

### 3. Outbound Delivery Orders (`DEL-YYYYMMDD-XXXXX`)
- Dispatch orders for customer shipment.
- **Inventory Sufficiency Check**: Pre-validates source bin balances before allowing line additions or dispatch to prevent negative inventory.
- Real-time $- \Delta$ stock deduction on validation.

### 4. Internal Bin Transfers (`INT-YYYYMMDD-XXXXX`)
- Relocate raw materials and components between internal warehouse zones (e.g. Storage Bay $\rightarrow$ Production Floor).
- Verifies source stock and moves inventory atomically across locations.

### 5. Physical Cycle Count Adjustments (`ADJ-YYYYMMDD-XXXXX`)
- Reconcile physical inventory counts against recorded system balances.
- Live Difference Calculator ($\Delta = \text{Counted} - \text{System}$) with automated $+X$ (gain) / $-X$ (loss) write-off journal entries.

### 6. Barcode / SKU Command Palette (`Ctrl+K` or `/`)
- Global scanner input available on every screen.
- Instantly look up product inventory levels, find active documents, or trigger quick dispatch actions with keyboard shortcuts.

### 7. Immutable Stock Ledger & CSV Export
- Full sequential audit journal of every stock increment, decrement, and transfer.
- Filterable by product, date, and document type with one-click CSV ledger download.

---

## 📊 Visualizations & Ergonomics

- **Operations Dispatch Throughput**: Real-time status comparison bars (`Pending` vs `Completed`) across all document pipelines.
- **Category Inventory Distribution**: Volume share breakdown across raw materials, finished goods, components, and consumables.
- **Location Capacity Gauges**: Visual bin utilization bars showing stock concentration across warehouse areas.
- **Stock Health Indicators**: Progress bars illustrating current quantity vs minimum reorder thresholds.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16 (App Router)** | Full-stack React framework with Turbopack |
| **React 19** | Component architecture & client-side state |
| **TypeScript 5** | Strict end-to-end type safety |
| **Supabase (PostgreSQL)** | Relational database, RLS policies, indexes, and triggers |
| **Clerk Authentication** | Multi-factor auth, session management, and OTP password reset |
| **Tailwind CSS v4** | Industrial utilitarian design system tokens |
| **Lucide React** | Logistics and warehouse operations icons |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/TheRaj71/Stocksenseodoo.git
cd Stocksenseodoo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your Clerk and Supabase credentials:
```bash
cp .env.example .env.local
```

Fill in:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Run Database Migrations (Supabase)
Apply the SQL files in `supabase/migrations/`:
1. `20260926051911_initial_stocksense_schema.sql` (Tables & Enums)
2. `20260926052000_seed_initial_data.sql` (Initial Warehouses, Categories, Locations)
3. `20260926053000_enable_rls_policies.sql` (Row-Level Security Policies)
4. `20260926120000_update_schema_for_complex_inventory.sql` (Column Updates & Indexes)

### 5. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001`) in your browser.

---

## 🚢 Deploying to Render

You can deploy StockSense to [Render](https://render.com) using either the **Render Blueprint (Recommended)** or as a **Manual Web Service**.

### Option A: Render Blueprint (1-Click Automated Setup)

The repository includes a production-ready [`render.yaml`](file:///render.yaml) configuration:

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository (`TheRaj71/Stocksenseodoo`) and select the `feature-frontend` (or `master`) branch.
4. Render will detect `render.yaml` and configure the Web Service automatically.
5. In the **Environment Variables** prompt, fill in your Clerk and Supabase secret keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL` (optional direct connection string)
6. Click **Apply**. Render will build and deploy the application.

---

### Option B: Manual Web Service Deployment

1. On the [Render Dashboard](https://dashboard.render.com/), click **New +** → **Web Service**.
2. Connect your GitHub repository (`TheRaj71/Stocksenseodoo`).
3. Configure the following service settings:
   - **Name**: `stocksense-ims`
   - **Runtime**: `Node`
   - **Branch**: `feature-frontend` (or `master`)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
   - **Instance Type**: `Free` or `Starter`
4. Under **Environment Variables**, add the following keys:

| Key | Value / Example | Notes |
| :--- | :--- | :--- |
| `NODE_VERSION` | `20.18.0` | Node.js runtime version |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` | From Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | `sk_test_...` or `sk_live_...` | From Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | Path for authentication |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | Path for signup |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/` | Post-auth landing |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/` | Post-auth landing |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xcwypudfijavfstpmpbh.supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase service_role key |
| `DATABASE_URL` | `postgresql://postgres:...@...:5432/postgres` | Direct PostgreSQL URL |
| `DIRECT_URL` | `postgresql://postgres:...@...:5432/postgres` | Direct session pooler URL |

5. Click **Create Web Service**.

---

### 🔑 Post-Deployment Clerk Configuration

Once your Render app is deployed (e.g. `https://stocksense-ims.onrender.com`):

1. Open the [Clerk Dashboard](https://dashboard.clerk.com/) → **Paths** & **Domains**.
2. Under **Production instance** (or Development instance if testing):
   - Add your Render domain (`https://stocksense-ims.onrender.com`) to the **Allowed Redirect URLs** and **Home URL**.
3. (Optional) Set up the Clerk Webhook endpoint pointing to `https://stocksense-ims.onrender.com/api/webhooks/clerk` to auto-sync user profiles with PostgreSQL.

---

## 🔒 Security & Permissions

All database operations enforce PostgreSQL **Row Level Security (RLS)**:
- **`ADMIN`**: Full system and master data configuration authority.
- **`INVENTORY_MANAGER`**: Manages product master catalogs, suppliers, customers, and locations.
- **`WAREHOUSE_STAFF`**: Operational authority to draft documents, pick/pack items, execute bin transfers, and validate stock movements.

---

## 🧪 Testing

To run the automated end-to-end operational test suite covering product creation, receipt validation, internal transfers, customer delivery, cycle count adjustment, and audit log generation:
```bash
npx tsx --env-file=.env.local test-e2e-flows.ts
```
Or access the live test endpoint directly in the browser at `/api/test-e2e`.

---

## 📄 License
This project is open-source under the MIT License.
