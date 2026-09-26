<div align="center">

# 📦 StockSense — Enterprise Warehouse & Inventory Management System

**An industrial-grade, high-throughput ops console built for modern warehouse logistics, inventory reconciliation, and real-time ledger accounting.**

[![Build Status](https://img.shields.io/badge/Build-Passing-22C55E?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/TheRaj71/Stocksenseodoo)
[![Next.js](https://img.shields.io/badge/Next.js_16.3-Turbopack-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-Modern_Hooks-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_RLS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Enterprise_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Render](https://img.shields.io/badge/Render-Deploy_Ready-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

[🌐 Live Demo](http://localhost:3001) • [🚀 Deploy on Render](#-deploying-to-render) • [📊 System Architecture](#-system-architecture) • [⚡ Core Workflows](#-core-operational-workflows) • [🧪 Testing](#-automated-e2e-testing)

</div>

---

## 📈 Real-Time Operations Cockpit & Live Metrics

```
+==================================================================================================+
|  STOCKSENSE OPS CONSOLE v2.4                      [ ACTIVE NODE: MAIN WAREHOUSE - WH/MAIN ]      |
+==================================================================================================+
|  [TOTAL PRODUCTS]     [ACTION REQUIRED]    [INBOUND RECEIPTS]    [OUTBOUND DELIVERIES]   [HEALTH]|
|     1,420 SKUs            18 Docs               12 Pending            15 Queued           99.8%  |
|  [████████████░░]     [███░░░░░░░░░░░░]     [██████░░░░░░░░]      [███████░░░░░░░]        NORMAL |
+--------------------------------------------------------------------------------------------------+
|  QUICK SCAN COMMAND PALETTE (Press 'Ctrl + K' or '/' anywhere to scan barcode / SKU)             |
|  > Scan: [ WIDGET-PRO-100 ] --> Location: WH/STOCK/BAY-A2 | On Hand: 124 Units | Reorder: 40    |
+==================================================================================================+
```

### 📊 Real-Time Operations Summary

| Metric Stream | Live Value | Status / Threshold | Dynamic Visual Indicator |
| :--- | :--- | :--- | :--- |
| **Active Catalog SKUs** | `1,420 SKUs` | Optimal | `[████████████████░░] 88% Capacity` |
| **Low-Stock Shortages** | `4 Items` | **Action Needed** | `[██████░░░░░░░░░░░░] Critical Reorder` |
| **Pending Inbound (REC)** | `12 Shipments` | In Progress | `[████████░░░░░░░░░░] 66% Docked` |
| **Pending Outbound (DEL)** | `15 Orders` | Staged for Pick | `[██████████░░░░░░░░] 75% Allocated` |
| **Internal Bin Relocations** | `7 Transfers` | Active Transit | `[████░░░░░░░░░░░░░░] 30% In Move` |
| **Physical Count Variance** | `0.02% Deviation`| Ledger Reconciled | `[██████████████████] 100% Balanced` |

---

## 🏗️ System Architecture & Data Flow

```mermaid
graph TD
    subgraph CLIENT_LAYER["🖥️ FRONTEND OPS CONSOLE (Next.js 16 + React 19)"]
        UI_SHELL["🏢 AppShell & TopBar Multi-Warehouse Switcher"]
        CMD_PALETTE["🔍 Barcode / SKU Quick Scanner (Ctrl+K)"]
        DASH_VIEW["📊 Real-Time Operations Dashboard & Analytics"]
        OPS_VIEWS["📦 Receipts | Deliveries | Transfers | Adjustments | Catalog"]
        LEDGER_VIEW["📜 Double-Entry Stock Ledger & CSV Audit Export"]
    end

    subgraph SERVER_LAYER["⚡ SERVER ACTIONS LAYER ('use server')"]
        SA_PRODUCTS["app/actions/products.ts"]
        SA_RECEIPTS["app/actions/receipts.ts"]
        SA_DELIVERIES["app/actions/deliveries.ts"]
        SA_STOCK["app/actions/stock.ts"]
        SA_DASH["app/actions/dashboard.ts"]
        SA_USER["app/actions/sync-user.ts"]
    end

    subgraph DB_LAYER["🗄️ SUPABASE POSTGRESQL ENGINE"]
        AUTH_RLS["🔒 Row Level Security & Clerk JWT Auth"]
        TBL_PROD["Product & Category Catalog"]
        TBL_STOCK["StockItem (Real-Time Bin Balances)"]
        TBL_DOC["StockDocument (ACID State Transitions)"]
        TBL_MOVE["StockMoveLine (Granular Item Allocations)"]
        TBL_LEDGER["StockLedger (Immutable Audit Journal)"]
    end

    CLIENT_LAYER -->|Server Action Invocation| SERVER_LAYER
    SERVER_LAYER -->|PostgreSQL Transaction / RLS| DB_LAYER
    DB_LAYER -.->|Real-time Balance Updates| CLIENT_LAYER
```

---

## 🔄 ACID Inventory State Engine & Stock Impact

Every warehouse document (`RECEIPT`, `DELIVERY`, `INTERNAL_TRANSFER`, `ADJUSTMENT`) executes through a strictly validated state machine with atomic stock calculations ($\pm \Delta$):

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Create Document (REC / DEL / INT / ADJ)
    
    DRAFT --> WAITING: Stage Line Items & Verify Stock
    note right of WAITING
      Inbound: Awaiting Vendor Arrival
      Outbound: Sufficiency Balance Check
    end note

    WAITING --> READY: Quality Inspection & Bay Allocation
    note right of READY
      Items picked, packed, and assigned to physical bin
    end note

    READY --> DONE: Atomically Validate & Execute
    note right of DONE
      • Inbound REC: +Δ StockItem Balance
      • Outbound DEL: -Δ StockItem Balance
      • Transfer INT: Location A ➔ Location B
      • Adjustment: System vs Physical Reconciliation
      • Appends Immutable StockLedger Entry
    end note

    DRAFT --> CANCELLED: Void Transaction
    WAITING --> CANCELLED: Cancel Shipment
    READY --> CANCELLED: Abort Operation
    
    DONE --> [*]
    CANCELLED --> [*]
```

---

## 🔀 End-to-End Double-Entry Ledger Transaction Flow

```mermaid
sequenceDiagram
    autonumber
    actor Staff as 👷 Warehouse Operator
    participant UI as 🖥️ Next.js Ops Console
    participant Action as ⚡ Server Action (receipts/deliveries)
    participant DB as 🗄️ Supabase PostgreSQL
    participant Ledger as 📜 Immutable StockLedger

    Staff->>UI: Scan Barcode & Stage Document Line Items
    UI->>Action: validateStockDocument(docId, lines)
    Action->>DB: Check Source Location Balance & Lock Rows
    DB-->>Action: Row Balances Verified
    Action->>DB: UPDATE StockItem (Apply +/- Delta Qty)
    Action->>DB: UPDATE StockDocument (Set Status = 'DONE', validatedAt = NOW())
    Action->>Ledger: INSERT INTO StockLedger (docRef, productId, delta, newBalance)
    DB-->>UI: Atomic Transaction Committed (HTTP 200)
    UI-->>Staff: Render Before/After Visual Balance Feedback
```

---

## 🗺️ Multi-Warehouse & Location Topology

```mermaid
erDiagram
    Warehouse ||--o{ Location : "partitions into"
    Location ||--o{ StockItem : "houses"
    Product ||--o{ StockItem : "quantified in"
    Category ||--o{ Product : "classifies"
    UnitOfMeasure ||--o{ Product : "measures"
    StockDocument ||--o{ StockMoveLine : "contains"
    Product ||--o{ StockMoveLine : "referenced by"
    Location ||--o{ StockMoveLine : "routes from/to"
    StockMoveLine ||--|| StockLedger : "audited in"

    Warehouse {
        string id PK
        string name "Main Distribution Center"
        string shortCode "WH-MAIN"
    }

    Location {
        string id PK
        string warehouseId FK
        string name "Bay A-02 / Shelf 3"
        enum type "INTERNAL | VENDOR | CUSTOMER | SCRAP"
    }

    Product {
        string id PK
        string sku "SKU-WDG-990"
        string name "Precision Sensor Node"
        int minQuantity "Safety threshold"
        int maxQuantity "Bin capacity limit"
        float unitCost "$45.00"
    }

    StockItem {
        string id PK
        string productId FK
        string locationId FK
        int quantity "Real-time on-hand"
    }
```

---

## ⚡ Core Operational Workflows

<details open>
<summary><b>📥 1. Inbound Goods Receipts (Procurement & Receiving)</b></summary>
<br>

- **Identifier**: `REC-YYYYMMDD-XXXXX`
- **Workflow**: Vendor shipment $\rightarrow$ Dock receiving $\rightarrow$ Quality control $\rightarrow$ Bay put-away.
- **Stock Impact**: Automatically adds $+\Delta$ to target storage bin balances upon validation.
- **Visual Feedback**: Real-time before/after quantity simulator flags upcoming stock increases.

```
+--------------------------------------------------------------------------------+
| RECEIPT: REC-20260926-00042  |  VENDOR: Apex Industrial  |  STATUS: [4. DONE]   |
+--------------------------------------------------------------------------------+
| PRODUCT CODE        PRODUCT NAME             UOM    QTY    LOCATION    STOCK Δ |
| SKU-STEEL-400       High-Tensile Fasteners   Boxes   50    WH/BAY-A1    +50    |
| SKU-BRNG-200        Sealed Ball Bearings     Units  100    WH/BAY-B3   +100    |
+--------------------------------------------------------------------------------+
| [VALIDATE RECEIPT] --> Atomically updated StockItem & created Ledger entries!  |
+--------------------------------------------------------------------------------+
```

</details>

<details open>
<summary><b>📤 2. Outbound Delivery Orders (Picking & Dispatch)</b></summary>
<br>

- **Identifier**: `DEL-YYYYMMDD-XXXXX`
- **Workflow**: Sales order $\rightarrow$ Pick list $\rightarrow$ Packing station $\rightarrow$ Shipping bay.
- **Sufficiency Engine**: Pre-validates source location balances to prevent negative inventory.
- **Stock Impact**: Automatically deducts $-\Delta$ from assigned storage location upon validation.

```
+--------------------------------------------------------------------------------+
| DELIVERY: DEL-20260926-00018 | CUSTOMER: Global Logistics | STATUS: [3. READY] |
+--------------------------------------------------------------------------------+
| PRODUCT CODE        LOCATION     AVAILABLE    PICK QTY    AFTER STOCK   STATUS |
| SKU-SNS-100         WH/BAY-C1       80          20            60        [ OK ] |
| SKU-VALV-300        WH/BAY-A2       15          30           -15   [SHORTAGE]  |
+--------------------------------------------------------------------------------+
| [VALIDATE DISPATCH] --> Prevents fulfillment when source stock is insufficient |
+--------------------------------------------------------------------------------+
```

</details>

<details>
<summary><b>🔄 3. Internal Bin Transfers (Inter-Zone Relocations)</b></summary>
<br>

- **Identifier**: `INT-YYYYMMDD-XXXXX`
- **Workflow**: Move stock between internal warehouse zones (e.g. Bulk Storage $\rightarrow$ Packing Bay $\rightarrow$ Production Line).
- **Safety**: Atomic source balance deduction and destination balance increment in a single database transaction.

</details>

<details>
<summary><b>⚖️ 4. Physical Cycle Count Adjustments (Reconciliation)</b></summary>
<br>

- **Identifier**: `ADJ-YYYYMMDD-XXXXX`
- **Variance Formula**: $\Delta = \text{Counted Quantity} - \text{System Recorded Balance}$
- **Automated Discrepancy Journaling**:
  - Positive $\Delta$ $\rightarrow$ Stock Gain (Inventory Write-Up)
  - Negative $\Delta$ $\rightarrow$ Stock Loss (Shrinkage / Damage Write-Off)

</details>

<details>
<summary><b>📜 5. Immutable Stock Audit Ledger & CSV Export</b></summary>
<br>

- **Sequential Audit Journal**: High-integrity ledger tracking every physical stock change.
- **Attributes Captured**: Timestamp, Operator Identity, Document Reference, Product SKU, Source Bin, Destination Bin, Quantity Delta ($\pm \Delta$), and Resulting Balance.
- **Exporting**: 1-Click filterable CSV ledger generation for ERP sync and compliance reporting.

</details>

---

## 🛠️ Tech Stack & Engineering Standards

| Layer | Technology | Operational Highlights |
| :--- | :--- | :--- |
| **Core Framework** | **Next.js 16.3 (App Router)** | Turbopack compilation, React Server Components, zero-latency server actions |
| **Client UI** | **React 19 & Tailwind CSS v4** | Industrial utilitarian design system (0–2px radii, hairline dividers, monospace numbers) |
| **Authentication** | **Clerk Enterprise** | Multi-factor auth, session management, OTP reset, and role permissions |
| **Database** | **Supabase (PostgreSQL)** | RLS security policies, stored triggers, ACID transactions, and index optimizations |
| **Visual Analytics** | **Custom Canvas / SVG** | Real-time throughput bars, category volume distribution, and capacity gauges |
| **Deployment** | **Render Cloud** | Automated blueprint orchestrations (`render.yaml`), Docker multi-stage builds |

---

## 🚀 Quickstart & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/TheRaj71/Stocksenseodoo.git
cd Stocksenseodoo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env.local` using the template:
```bash
cp .env.example .env.local
```

Configure your Clerk and Supabase credentials:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase PostgreSQL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres:...@...:5432/postgres
DIRECT_URL=postgresql://postgres:...@...:5432/postgres
```

### 4. Run Database Schema & Seeds
Execute the migration scripts located in `supabase/migrations/`:
```bash
# Apply initial tables, enums, triggers, and seed data via Supabase SQL Editor
1. supabase/migrations/20260926051911_initial_stocksense_schema.sql
2. supabase/migrations/20260926052000_seed_initial_data.sql
3. supabase/migrations/20260926053000_enable_rls_policies.sql
```

### 5. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:3001](http://localhost:3001)** (or `http://localhost:3000`) in your browser.

---

## 🚢 Deploying to Render

### Option A: Render Blueprint (1-Click Setup)

The repository includes a ready-to-run [`render.yaml`](render.yaml):

1. Go to your **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Select `TheRaj71/Stocksenseodoo` and branch `master`.
4. Enter your secret keys in the environment prompt and click **Apply**.

### Option B: Manual Web Service

1. On **Render Dashboard**, click **New +** $\rightarrow$ **Web Service**.
2. Connect `TheRaj71/Stocksenseodoo`.
3. Set the following parameters:
   - **Environment**: `Node`
   - **Node Version**: `20.18.0`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Add all environment variables from `.env.example`.
5. Click **Create Web Service**.

---

## 🧪 Automated E2E Testing

StockSense includes an end-to-end operational verification script that validates real database mutations:

```bash
npx tsx --env-file=.env.local test-e2e-flows.ts
```

**Verified Test Pipeline**:
```
[PASS] Step 1: Product Master Creation (SKU: WIDGET-PRO-100)
[PASS] Step 2: Inbound Goods Receipt (+100 Units -> StockItem Balance = 100)
[PASS] Step 3: Internal Bin Transfer (30 Units moved from Bay A to Bay B)
[PASS] Step 4: Outbound Customer Delivery (-20 Units -> StockItem Balance = 80)
[PASS] Step 5: Physical Cycle Count Adjustment (-5 Units discrepancy write-off -> 75)
[PASS] Step 6: Immutable Stock Ledger Audit Trail (4 verified ledger records)
```

You can also run live health checks and test endpoints:
- **Health Check**: `GET /api/health`
- **E2E Test Runner**: `GET /api/test-e2e`

---

## 📄 License
This project is open-source and licensed under the **MIT License**.
