<div align="center">

<<<<<<< HEAD
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
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'16px'}}}%%
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
=======
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
>>>>>>> 36cf1e8ea87c078bb189fc9487fc04d3558be2e8

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
<<<<<<< HEAD

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
=======
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
>>>>>>> 36cf1e8ea87c078bb189fc9487fc04d3558be2e8
```

---

## 🔄 ACID Inventory State Engine & Stock Impact

<<<<<<< HEAD
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
=======
Every warehouse document (`RECEIPT`, `DELIVERY`, `INTERNAL_TRANSFER`, `ADJUSTMENT`) executes through a strictly validated state machine with atomic stock calculations ($\pm \Delta$):
>>>>>>> 36cf1e8ea87c078bb189fc9487fc04d3558be2e8

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

### 🎯 Feature Capabilities Matrix

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#4f46e5','primaryTextColor':'#fff','primaryBorderColor':'#312e81','lineColor':'#6366f1','secondaryColor':'#059669','tertiaryColor':'#dc2626'}}}%%
quadrantChart
    title StockSense Feature Prioritization
    x-axis Low Complexity --> High Complexity
    y-axis Low Business Value --> High Business Value
    quadrant-1 Strategic Features
    quadrant-2 Quick Wins
    quadrant-3 Low Priority
    quadrant-4 Consider Outsourcing
    Receipt Validation: [0.7, 0.9]
    Delivery Orders: [0.65, 0.85]
    Real-time Dashboard: [0.55, 0.8]
    Barcode Scanner: [0.3, 0.75]
    Stock Ledger: [0.4, 0.7]
    Cycle Counts: [0.6, 0.65]
    Location Mgmt: [0.25, 0.6]
    CSV Export: [0.2, 0.5]
    Multi-Warehouse: [0.8, 0.95]
    RLS Security: [0.75, 0.9]
```

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

<<<<<<< HEAD
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
=======
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
>>>>>>> 36cf1e8ea87c078bb189fc9487fc04d3558be2e8

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

<<<<<<< HEAD
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
=======
### Option A: Render Blueprint (1-Click Setup)
>>>>>>> 36cf1e8ea87c078bb189fc9487fc04d3558be2e8

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

<<<<<<< HEAD
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
=======
>>>>>>> 36cf1e8ea87c078bb189fc9487fc04d3558be2e8
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
<<<<<<< HEAD

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
=======
This project is open-source and licensed under the **MIT License**.
>>>>>>> 36cf1e8ea87c078bb189fc9487fc04d3558be2e8
