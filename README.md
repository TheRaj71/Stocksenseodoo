# 📦 StockSense — Enterprise Warehouse & Inventory Management System (IMS)

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-emerald?logo=supabase)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF?logo=clerk)](https://clerk.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Deployed on Render](https://img.shields.io/badge/Render-Deployed-46E3B7?logo=render&logoColor=white)](https://render.com)

**StockSense** is a high-throughput, modular Inventory Management System (IMS) engineered to digitize and streamline warehouse operations. Built to replace manual registers, error-prone spreadsheets, and fragmented tracking tools, StockSense provides inventory managers and warehouse staff with a centralized, real-time, industrial-grade operational console.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER (Next.js 16 + React 19)              │
│  • AppShell & Multi-Warehouse Context Switcher                          │
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
- **Per-Location Stock Breakdown**: Inspect on-hand quantities across physical locations (`WH/Stock`, `WH/Production Floor`, `WH/Packing Area`, `WH/QC`).
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

## 📊 Visualizations & Operations Ergonomics

- **Operations Dispatch Throughput**: Real-time status comparison bars (`Pending` vs `Completed`) across all document pipelines.
- **Category Inventory Distribution**: Volume share breakdown across raw materials, finished goods, components, and consumables.
- **Location Capacity Gauges**: Visual bin utilization bars showing stock concentration across warehouse areas.
- **Stock Health Indicators**: Progress bars illustrating current quantity vs minimum reorder thresholds.

---

## 🚢 Render Cloud Deployment

StockSense is configured for zero-downtime deployment on [Render](https://render.com).

### Option A: Render Blueprint (1-Click Setup via `render.yaml`)

The repository includes a production [`render.yaml`](render.yaml) blueprint:

1. Go to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Select your repository (`TheRaj71/Stocksenseodoo`) and branch (`master` or feature branch).
4. Enter your environment secret keys when prompted.
5. Click **Apply** to trigger the automated build and deployment.

### Option B: Render Web Service (Manual Setup)

1. On the [Render Dashboard](https://dashboard.render.com/), click **New +** $\rightarrow$ **Web Service**.
2. Connect your repository (`TheRaj71/Stocksenseodoo`).
3. Set the following build configuration:
   - **Environment**: `Node`
   - **Node Version**: `20.18.0`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Add the required Environment Variables listed below.

### 🔐 Production Environment Variables

| Variable | Description / Value |
| :--- | :--- |
| `NODE_VERSION` | `20.18.0` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key (`pk_live_...` or `pk_test_...`) |
| `CLERK_SECRET_KEY` | Clerk Secret Key (`sk_live_...` or `sk_test_...`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL (`https://your-ref.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Client Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key |
| `DATABASE_URL` | Direct PostgreSQL connection string |
| `DIRECT_URL` | Direct session pooler connection string |

### 🌐 Post-Deployment Clerk Allowlist
After Render provisions your live domain (e.g. `https://stocksense-ims.onrender.com`):
1. Go to **Clerk Dashboard** $\rightarrow$ **Configure** $\rightarrow$ **Paths & Domains**.
2. Add your Render URL to **Allowed Redirect URLs** and **Home URL**.

---

## 💻 Local Development

### 1. Clone & Install
```bash
git clone https://github.com/TheRaj71/Stocksenseodoo.git
cd Stocksenseodoo
npm install
```

### 2. Environment Setup
Create `.env.local` based on `.env.example`:
```bash
cp .env.example .env.local
```

### 3. Start Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001`).

---

## 🧪 Testing

Run the automated operational flow tests (Product creation $\rightarrow$ Inbound receipt $\rightarrow$ Bin transfer $\rightarrow$ Outbound delivery $\rightarrow$ Cycle count $\rightarrow$ Ledger audit):
```bash
npx tsx --env-file=.env.local test-e2e-flows.ts
```
Or check the live health and test API endpoints:
- Health Check: `/api/health`
- E2E Test Suite: `/api/test-e2e`

---

## 📄 License
This project is open-source under the MIT License.
