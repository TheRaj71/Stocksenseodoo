# 📦 StockSense — Warehouse & Inventory Management System (IMS)

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-emerald?logo=supabase)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF?logo=clerk)](https://clerk.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Documentation](https://img.shields.io/badge/docs-comprehensive-blue)](./ARCHITECTURE.md)

</div>

**StockSense** is a high-throughput, modular Inventory Management System (IMS) engineered to digitize and streamline warehouse operations. Built to replace manual registers, error-prone spreadsheets, and fragmented tracking tools, StockSense provides inventory managers and warehouse picking/shelving staff with a centralized, real-time, industrial-grade ops console.

---

## ✨ Key Highlights

<div align="center">

| 🎯 Feature | 📊 Capability | ⚡ Benefit |
|------------|---------------|------------|
| **Real-time Dashboard** | Live KPIs & Analytics | Instant operational insights |
| **Barcode Integration** | Quick SKU lookup (Ctrl+K) | Rapid product access |
| **Multi-Warehouse** | Isolated operations | Scalable architecture |
| **Audit Trail** | Immutable ledger | Full compliance |
| **RLS Security** | Role-based access | Enterprise-grade protection |
| **Stock Validation** | Inventory sufficiency checks | Zero negative stock |

</div>

```mermaid
mindmap
  root((StockSense<br/>IMS))
    Operations
      Goods Receipt
      Delivery Orders
      Bin Transfers
      Cycle Counts
    Analytics
      Real-time Dashboard
      Stock Alerts
      Movement Tracking
      Location Utilization
    Security
      JWT Auth
      Row Level Security
      Audit Logs
      Role Permissions
    Integration
      Barcode Scanner
      CSV Export
      Multi-Warehouse
      Supplier/Customer Mgmt
```

---

## 📑 Table of Contents

- [🏗️ System Architecture](#️-system-architecture)
- [🔄 Document Lifecycle Flow](#-document-lifecycle-flow)
- [📦 Inventory Movement Process](#-inventory-movement-process)
- [⚡ Core Operational Features](#-core-operational-features)
- [📊 Data Model Overview](#-data-model-overview)
- [🔒 Security & Permission Model](#-security--permission-model)
- [📊 Visualizations & Ergonomics](#-visualizations--ergonomics)
- [🎨 User Interface Highlights](#-user-interface-highlights)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🚢 Deploying to Render](#-deploying-to-render)
- [🔒 Security & Permissions](#-security--permissions)
- [🧪 Testing](#-testing)
- [📁 Project Structure](#-project-structure)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Frontend["🎨 FRONTEND LAYER - Next.js 16 + React 19"]
        UI[🖥️ AppShell & Multi-Warehouse Selector]
        CMD[⌨️ Barcode & SKU Command Palette]
        DASH[📊 Operations Dashboard]
        CATALOG[📦 Product Catalog with Stock Drawers]
        DOCS[📋 Receipts, Deliveries, Transfers, Adjustments]
    end

    subgraph Actions["⚡ SERVER ACTIONS LAYER"]
        PRODUCTS[products.ts<br/>Catalog CRUD]
        RECEIPTS[receipts.ts<br/>Inbound Shipments]
        DELIVERIES[deliveries.ts<br/>Outbound Orders]
        STOCK[stock.ts<br/>Bin Transfers]
        DASHBOARD[dashboard.ts<br/>Real-Time KPIs]
        SYNC[sync-user.ts<br/>Identity Sync]
    end

    subgraph Database["🗄️ DATABASE LAYER - Supabase PostgreSQL"]
        TABLES[(10 Core Tables<br/>Product, StockItem<br/>StockDocument, MoveLine)]
        RLS[🔒 Row-Level Security<br/>Role Permissions Matrix]
        TRIGGERS[⚙️ Automated Triggers<br/>Sequential Reference Gen]
    end

    Frontend -->|Server Actions| Actions
    Actions -->|PostgreSQL RLS<br/>+ Clerk JWT| Database
    
    style Frontend fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff
    style Actions fill:#059669,stroke:#065f46,stroke-width:2px,color:#fff
    style Database fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff
```

---

## 🔄 Document Lifecycle Flow

```mermaid
stateDiagram-v2
    [*] --> Draft: Create Document
    Draft --> Draft: Add/Edit Lines
    Draft --> Validated: Validate & Process
    Draft --> Cancelled: Cancel
    Validated --> [*]: Complete
    Cancelled --> [*]
    
    note right of Draft
        Documents: REC (Receipts)
        DEL (Deliveries)
        INT (Transfers)
        ADJ (Adjustments)
    end note
    
    note right of Validated
        ✓ Stock Updated
        ✓ Audit Log Created
        ✓ Immutable Record
    end note
```

---

## 📦 Inventory Movement Process

```mermaid
sequenceDiagram
    participant User as 👤 Warehouse Staff
    participant UI as 🖥️ Frontend
    participant Action as ⚡ Server Action
    participant DB as 🗄️ PostgreSQL
    participant Audit as 📝 Audit Log

    User->>UI: Create Receipt (REC-XXXXX)
    UI->>Action: Add Product Lines
    Action->>DB: Check Product & Location
    DB-->>Action: Validation OK
    
    User->>UI: Click "Validate Receipt"
    UI->>Action: validateReceipt()
    
    Action->>DB: BEGIN TRANSACTION
    Action->>DB: Update StockItem (+qty)
    Action->>DB: Create StockMoveLine
    Action->>DB: Update Document Status
    DB-->>Audit: Log Movement
    Action->>DB: COMMIT
    
    DB-->>UI: Success ✓
    UI-->>User: Stock Updated!
```

---

## ⚡ Core Operational Features

### 📋 Document Types & Operations

```mermaid
graph LR
    subgraph Inbound["📥 INBOUND"]
        REC[REC-XXXXX<br/>Goods Receipt<br/>Vendor → Warehouse]
    end
    
    subgraph Internal["🔄 INTERNAL"]
        INT[INT-XXXXX<br/>Bin Transfer<br/>Location → Location]
        ADJ[ADJ-XXXXX<br/>Cycle Count<br/>Physical Adjustment]
    end
    
    subgraph Outbound["📤 OUTBOUND"]
        DEL[DEL-XXXXX<br/>Delivery Order<br/>Warehouse → Customer]
    end
    
    VENDOR((🏢 Vendor)) -->|Supply| REC
    REC -->|Stock+| WAREHOUSE[(🏭 Warehouse<br/>Stock Items)]
    WAREHOUSE -->|Move| INT
    INT -->|Relocate| WAREHOUSE
    WAREHOUSE -->|Stock-| DEL
    DEL -->|Ship| CUSTOMER((👤 Customer))
    AUDIT[📊 Audit Team] -->|Count| ADJ
    ADJ -->|Adjust±| WAREHOUSE
    
    style Inbound fill:#059669,stroke:#065f46,stroke-width:2px,color:#fff
    style Internal fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000
    style Outbound fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff
```

### 1. Master Catalog & Location Stock Tracking
- **SKU Management**: Unique alphanumeric SKU codes with category classification, unit costs, and unit of measure (UOM).
- **Per-Location Stock Breakdown**: Inspect on-hand quantities across specific physical locations (`WH/Stock`, `WH/Production Floor`, `WH/Packing Area`, `WH/QC`).
- **Automated Thresholds**: Set minimum and maximum reorder points with color-coded stock progress bars and low-stock alerts.

### 2. Inbound Goods Receipts (`REC-YYYYMMDD-XXXXX`)
- Record vendor shipments against purchase orders.
- Add product lines with projected stock impact previews.
- **One-Click Validation**: Atomically updates `StockItem` balances, transitions document to `DONE`, and stamps audit logs.

### 3. Outbound Delivery Orders (`DEL-YYYYMMDD-XXXXX`)
- Dispatch orders for customer shipment.
- **Inventory Sufficiency Check**: Pre-validates source bin balances before allowing line additions or dispatch to prevent negative inventory.
- Real-time stock deduction on validation.

### 4. Internal Bin Transfers (`INT-YYYYMMDD-XXXXX`)
- Relocate raw materials and components between internal warehouse zones.
- Verifies source stock and moves inventory atomically across locations.

### 5. Physical Cycle Count Adjustments (`ADJ-YYYYMMDD-XXXXX`)
- Reconcile physical inventory counts against recorded system balances.
- Live Difference Calculator with automated gain/loss write-off journal entries.

### 6. Barcode / SKU Command Palette (`Ctrl+K` or `/`)
- Global scanner input available on every screen.
- Instantly look up product inventory levels, find active documents, or trigger quick dispatch actions with keyboard shortcuts.

### 7. Immutable Stock Ledger & CSV Export
- Full sequential audit journal of every stock increment, decrement, and transfer.
- Filterable by product, date, and document type with one-click CSV ledger download.

---

## 📊 Data Model Overview

```mermaid
erDiagram
    WAREHOUSE ||--o{ LOCATION : contains
    WAREHOUSE ||--o{ STOCK_DOCUMENT : processes
    LOCATION ||--o{ STOCK_ITEM : stores
    PRODUCT ||--o{ STOCK_ITEM : tracked_in
    PRODUCT }o--|| CATEGORY : belongs_to
    STOCK_DOCUMENT ||--o{ STOCK_MOVE_LINE : contains
    STOCK_MOVE_LINE }o--|| PRODUCT : references
    STOCK_MOVE_LINE }o--|| LOCATION : from
    STOCK_MOVE_LINE }o--|| LOCATION : to
    CONTACT ||--o{ STOCK_DOCUMENT : vendor_or_customer

    PRODUCT {
        uuid id PK
        string sku UK
        string name
        decimal unit_cost
        uuid category_id FK
        int min_qty
        int max_qty
    }

    STOCK_ITEM {
        uuid id PK
        uuid product_id FK
        uuid location_id FK
        int quantity
        timestamp updated_at
    }

    STOCK_DOCUMENT {
        uuid id PK
        string reference UK
        enum doc_type
        enum status
        uuid warehouse_id FK
        timestamp created_at
    }

    STOCK_MOVE_LINE {
        uuid id PK
        uuid document_id FK
        uuid product_id FK
        uuid location_from FK
        uuid location_to FK
        int quantity
        string description
    }
```

---

## 🔒 Security & Permission Model

```mermaid
flowchart TD
    START([User Authentication]) --> CLERK{Clerk JWT<br/>Validation}
    CLERK -->|Valid| RLS[PostgreSQL RLS<br/>Check user_role]
    CLERK -->|Invalid| DENY[❌ Access Denied]
    
    RLS --> ROLE{User Role?}
    
    ROLE -->|ADMIN| ADMIN_ACCESS[✅ Full Access<br/>• Master Data Config<br/>• User Management<br/>• All Operations]
    
    ROLE -->|INVENTORY_MANAGER| MANAGER_ACCESS[✅ Manager Access<br/>• Product CRUD<br/>• Supplier/Customer<br/>• Location Setup<br/>• View All Docs]
    
    ROLE -->|WAREHOUSE_STAFF| STAFF_ACCESS[✅ Staff Access<br/>• Draft Documents<br/>• Pick/Pack Items<br/>• Bin Transfers<br/>• Validate Movements]
    
    ROLE -->|None/Invalid| DENY
    
    style ADMIN_ACCESS fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff
    style MANAGER_ACCESS fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    style STAFF_ACCESS fill:#059669,stroke:#065f46,stroke-width:2px,color:#fff
    style DENY fill:#475569,stroke:#1e293b,stroke-width:2px,color:#fff
```

---

## 📊 Visualizations & Ergonomics

- **Operations Dispatch Throughput**: Real-time status comparison bars (`Pending` vs `Completed`) across all document pipelines.
- **Category Inventory Distribution**: Volume share breakdown across raw materials, finished goods, components, and consumables.
- **Location Capacity Gauges**: Visual bin utilization bars showing stock concentration across warehouse areas.
- **Stock Health Indicators**: Progress bars illustrating current quantity vs minimum reorder thresholds.

---

## 🎨 User Interface Highlights

### Dashboard Analytics
```mermaid
pie title Inventory Distribution by Category
    "Raw Materials" : 385
    "Finished Goods" : 276
    "Components" : 189
    "Consumables" : 92
```

### Stock Movement Timeline
```mermaid
gantt
    title Weekly Stock Operations Schedule
    dateFormat YYYY-MM-DD
    section Receipts
    Morning Vendor Delivery    :done, r1, 2026-09-21, 2h
    Afternoon Shipment         :done, r2, 2026-09-22, 3h
    Bulk Order Processing      :active, r3, 2026-09-23, 4h
    section Deliveries
    Customer Order #1234       :done, d1, 2026-09-21, 1h
    Customer Order #1235       :done, d2, 2026-09-22, 2h
    Express Shipment           :active, d3, 2026-09-23, 1h
    section Cycle Counts
    Zone A Physical Count      :done, c1, 2026-09-20, 3h
    Zone B Adjustment          :active, c2, 2026-09-23, 2h
    Zone C Schedule            :crit, c3, 2026-09-24, 3h
```

---

## 🛠️ Tech Stack

```mermaid
mindmap
  root((StockSense<br/>Tech Stack))
    Frontend
      Next.js 16
        App Router
        Turbopack
        Server Actions
      React 19
        Hooks
        Suspense
        Transitions
      TypeScript 5
        Strict Mode
        Type Safety
      Tailwind CSS v4
        Design Tokens
        Responsive
    Backend
      Supabase
        PostgreSQL 15
        Row Level Security
        Triggers & Functions
      Clerk Auth
        JWT Tokens
        Multi-Factor
        Session Mgmt
    Tooling
      Lucide Icons
      Recharts
      shadcn/ui
      ESLint
```

### Technology Details

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

### Quick Start Flowchart

```mermaid
flowchart LR
    START([🚀 Start]) --> CLONE[📥 Clone Repo]
    CLONE --> INSTALL[📦 npm install]
    INSTALL --> ENV[🔑 Configure .env.local]
    ENV --> DB[🗄️ Run Migrations]
    DB --> DEV[⚡ npm run dev]
    DEV --> BROWSER[🌐 Open localhost:3000]
    BROWSER --> SUCCESS([✅ Ready!])
    
    style START fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff
    style SUCCESS fill:#059669,stroke:#065f46,stroke-width:2px,color:#fff
    style ENV fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000
    style DB fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff
```

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

### 🎯 Development Workflow

```mermaid
gitGraph
    commit id: "Initial Setup"
    commit id: "Database Schema"
    branch feature-frontend
    checkout feature-frontend
    commit id: "UI Components"
    commit id: "Dashboard Pages"
    commit id: "Product Catalog"
    checkout main
    merge feature-frontend tag: "v1.0"
    branch feature-receipts
    checkout feature-receipts
    commit id: "Receipt Logic"
    commit id: "Validation Flow"
    checkout main
    merge feature-receipts tag: "v1.1"
    commit id: "Production Deploy"
```

---

## 🚢 Deploying to Render

```mermaid
flowchart TB
    subgraph Local["💻 Local Development"]
        CODE[📝 Code Changes]
        COMMIT[📌 Git Commit]
        PUSH[⬆️ Git Push]
    end
    
    subgraph GitHub["🐙 GitHub Repository"]
        REPO[📦 Repository]
        BRANCH{Branch?}
    end
    
    subgraph Render["☁️ Render Platform"]
        DETECT[🔍 Detect render.yaml]
        BUILD[🔨 Build Process<br/>npm install<br/>npm run build]
        DEPLOY[🚀 Deploy]
        HEALTH[💚 Health Check]
    end
    
    subgraph Services["🔌 External Services"]
        CLERK[👤 Clerk Auth]
        SUPABASE[🗄️ Supabase DB]
    end
    
    CODE --> COMMIT
    COMMIT --> PUSH
    PUSH --> REPO
    REPO --> BRANCH
    BRANCH -->|main/feature-frontend| DETECT
    DETECT --> BUILD
    BUILD --> DEPLOY
    DEPLOY --> HEALTH
    HEALTH -.->|Validate| CLERK
    HEALTH -.->|Query| SUPABASE
    
    style Local fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff
    style Render fill:#059669,stroke:#065f46,stroke-width:2px,color:#fff
    style Services fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000
```

You can deploy StockSense to [Render](https://render.com) using either the **Render Blueprint (Recommended)** or as a **Manual Web Service**.

### Option A: Render Blueprint (1-Click Automated Setup)

The repository includes a production-ready `render.yaml` configuration:

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

### End-to-End Test Coverage

```mermaid
flowchart LR
    TEST_START([🧪 Test Suite]) --> PRODUCT[📦 Product Creation]
    PRODUCT --> RECEIPT[📥 Receipt Validation]
    RECEIPT --> TRANSFER[🔄 Internal Transfer]
    TRANSFER --> DELIVERY[📤 Customer Delivery]
    DELIVERY --> ADJUST[⚖️ Cycle Count Adjustment]
    ADJUST --> AUDIT[📝 Audit Log Verification]
    AUDIT --> SUCCESS([✅ All Tests Pass])
    
    style TEST_START fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff
    style SUCCESS fill:#059669,stroke:#065f46,stroke-width:2px,color:#fff
```

To run the automated end-to-end operational test suite covering product creation, receipt validation, internal transfers, customer delivery, cycle count adjustment, and audit log generation:
```bash
npx tsx --env-file=.env.local test-e2e-flows.ts
```
Or access the live test endpoint directly in the browser at `/api/test-e2e`.

---

## 📁 Project Structure

```mermaid
graph TD
    ROOT[📦 stocksenseodoo/] --> APP[📂 app/]
    ROOT --> COMPONENTS[📂 components/]
    ROOT --> LIB[📂 lib/]
    ROOT --> SUPABASE[📂 supabase/]
    ROOT --> PUBLIC[📂 public/]
    
    APP --> ACTIONS[📁 actions/]
    APP --> API[📁 api/]
    APP --> PAGES[📄 pages tsx]
    
    ACTIONS --> PRODUCTS_ACT[products.ts]
    ACTIONS --> RECEIPTS_ACT[receipts.ts]
    ACTIONS --> DELIVERIES_ACT[deliveries.ts]
    ACTIONS --> STOCK_ACT[stock.ts]
    ACTIONS --> DASH_ACT[dashboard.ts]
    
    COMPONENTS --> UI[📁 ui/]
    COMPONENTS --> CHARTS[📁 charts/]
    COMPONENTS --> SHARED[📁 shared/]
    
    LIB --> TYPES[types.ts]
    LIB --> SUPABASE_CLIENT[supabase.ts]
    LIB --> UTILS[utils.ts]
    
    SUPABASE --> MIGRATIONS[📁 migrations/]
    MIGRATIONS --> SCHEMA[schema.sql]
    MIGRATIONS --> SEED[seed.sql]
    MIGRATIONS --> RLS[rls_policies.sql]
    
    style ROOT fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff
    style APP fill:#059669,stroke:#065f46,stroke-width:2px,color:#fff
    style COMPONENTS fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000
    style LIB fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff
    style SUPABASE fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff
```

---

## 🗺️ Roadmap

```mermaid
timeline
    title StockSense Development Roadmap
    section Q1 2026
        Core IMS Foundation : Database Schema
                           : Basic CRUD Operations
                           : Authentication Setup
    section Q2 2026
        Advanced Features : Receipt & Delivery Flows
                         : Dashboard Analytics
                         : Barcode Integration
    section Q3 2026
        Enterprise Features : Multi-Warehouse Support
                           : Advanced RLS Policies
                           : Audit & Compliance
    section Q4 2026
        Optimization : Performance Tuning
                    : Mobile Responsive
                    : API Documentation
    section 2027
        Future Vision : AI-Powered Forecasting
                     : IoT Device Integration
                     : Advanced Reporting
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

```mermaid
flowchart LR
    START([👋 Want to<br/>Contribute?]) --> FORK[🍴 Fork Repo]
    FORK --> BRANCH[🌿 Create Branch]
    BRANCH --> CODE[💻 Make Changes]
    CODE --> TEST[🧪 Run Tests]
    TEST --> COMMIT[📝 Commit]
    COMMIT --> PR[🔀 Create PR]
    PR --> REVIEW{📋 Code Review}
    REVIEW -->|Approved| MERGE[✅ Merge]
    REVIEW -->|Changes Needed| CODE
    MERGE --> SUCCESS([🎉 Success!])
    
    style START fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff
    style SUCCESS fill:#059669,stroke:#065f46,stroke-width:2px,color:#fff
```

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For detailed guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📞 Support & Contact

```mermaid
mindmap
  root((Get Help))
    Documentation
      README.md
      API Docs
      Database Schema
    Community
      GitHub Issues
      Discussions
      Pull Requests
    Direct Contact
      Email Support
      Bug Reports
      Feature Requests
```

- 🐛 **Bug Reports**: [Create an Issue](https://github.com/TheRaj71/Stocksenseodoo/issues)
- 💡 **Feature Requests**: [Start a Discussion](https://github.com/TheRaj71/Stocksenseodoo/discussions)
- 📧 **Email**: [Support Contact](mailto:support@stocksense.example.com)

---

## 📄 License

This project is open-source under the MIT License.

---

<div align="center">

### ⭐ If you find StockSense useful, please star the repository!

```mermaid
graph LR
    A[❤️ Love StockSense?] --> B[⭐ Star on GitHub]
    B --> C[🚀 Help Us Grow]
    C --> D[🌟 Build Better Features]
    
    style A fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff
    style D fill:#059669,stroke:#065f46,stroke-width:2px,color:#fff
```

**Built with ❤️ for Warehouse Managers and Logistics Teams**

[🏠 Home](https://github.com/TheRaj71/Stocksenseodoo) • [📚 Documentation](./ARCHITECTURE.md) • [🎨 Diagrams](./DIAGRAMS.md) • [🤝 Contributing](./CONTRIBUTING.md) • [🐛 Issues](https://github.com/TheRaj71/Stocksenseodoo/issues) • [💬 Discussions](https://github.com/TheRaj71/Stocksenseodoo/discussions)

</div>
