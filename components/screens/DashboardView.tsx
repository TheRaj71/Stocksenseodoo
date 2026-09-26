'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  AlertTriangle, 
  Plus, 
  RefreshCw,
  ChevronRight,
  PackageCheck,
  TrendingUp,
  BarChart3,
  PieChart,
  MapPin
} from 'lucide-react';
import { KpiBlock } from '@/components/ui/KpiBlock';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmptyState } from '@/components/ui/Table';
import { OpsFlowChart } from '@/components/charts/OpsFlowChart';
import { StockDistributionChart } from '@/components/charts/StockDistributionChart';
import { LocationCapacityBars } from '@/components/charts/LocationCapacityBars';
import { DashboardKPIs, StockAlert } from '@/lib/types';
import { getDashboardKPIs, getStockAlerts, getRecentStockMovements, getDocumentCountsByStatus } from '@/app/actions/dashboard';
import { getReceipts } from '@/app/actions/receipts';
import { getDeliveries } from '@/app/actions/deliveries';
import { getInternalTransfers, getLocations } from '@/app/actions/stock';
import { getProducts, getCategories } from '@/app/actions/products';
import { formatDate } from '@/lib/utils';

export function DashboardView() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [recentMovements, setRecentMovements] = useState<any[]>([]);
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [docCounts, setDocCounts] = useState<Record<string, Record<string, number>>>({});
  const [categoryShares, setCategoryShares] = useState<any[]>([]);
  const [locationBalances, setLocationBalances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter tabs
  const [activeTab, setActiveTab] = useState<'ALL' | 'RECEIPT' | 'DELIVERY' | 'TRANSFER'>('ALL');

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [kpiRes, alertsRes, movesRes, recRes, delRes, transRes, countsRes, prodRes, catRes, locRes] = await Promise.all([
        getDashboardKPIs(),
        getStockAlerts(),
        getRecentStockMovements(),
        getReceipts(),
        getDeliveries(),
        getInternalTransfers(),
        getDocumentCountsByStatus(),
        getProducts(),
        getCategories(),
        getLocations(),
      ]);

      if (kpiRes.success && kpiRes.data) setKpis(kpiRes.data);
      if (alertsRes.success && alertsRes.data) setAlerts(alertsRes.data);
      if (movesRes.success && movesRes.data) setRecentMovements(movesRes.data);
      if (countsRes.success && countsRes.data) setDocCounts(countsRes.data);

      // Aggregate pending operations
      const allDocs: any[] = [];
      if (recRes.success && recRes.data) {
        recRes.data.forEach((d) => allDocs.push({ ...d, docTypeLabel: 'Receipt', urlPrefix: '/receipts' }));
      }
      if (delRes.success && delRes.data) {
        delRes.data.forEach((d) => allDocs.push({ ...d, docTypeLabel: 'Delivery', urlPrefix: '/deliveries' }));
      }
      if (transRes.success && transRes.data) {
        transRes.data.forEach((d) => allDocs.push({ ...d, docTypeLabel: 'Transfer', urlPrefix: '/transfers' }));
      }
      setPendingDocs(allDocs);

      // Compute Category Breakdown from live DB products
      if (prodRes.success && prodRes.data && catRes.success && catRes.data) {
        const catMap: Record<string, { count: number; totalQty: number }> = {};
        catRes.data.forEach((c) => {
          catMap[c.name] = { count: 0, totalQty: 0 };
        });

        prodRes.data.forEach((p) => {
          const catName = p.Category?.name || 'Uncategorized';
          if (!catMap[catName]) catMap[catName] = { count: 0, totalQty: 0 };
          catMap[catName].count += 1;
          catMap[catName].totalQty += (p.stock_quantity || 0);
        });

        const shares = Object.entries(catMap)
          .map(([name, data]) => ({ name, ...data }))
          .filter((c) => c.totalQty > 0 || c.count > 0);
        setCategoryShares(shares);
      }

      // Compute Location Stock Balances from live internal locations
      if (locRes.success && locRes.data) {
        const internalLocs = locRes.data.filter((l) => l.type === 'INTERNAL');
        // Calculate total quantity per location from products
        const locMap: Record<string, any> = {};
        internalLocs.forEach((l) => {
          locMap[l.id] = {
            name: l.name,
            shortCode: l.shortCode,
            warehouseName: (l as any).Warehouse?.name || 'Main Warehouse',
            totalQuantity: 0,
          };
        });

        if (prodRes.success && prodRes.data) {
          // Aggregate
          let totalAssigned = 0;
          prodRes.data.forEach((p) => {
            totalAssigned += (p.stock_quantity || 0);
          });
          if (internalLocs.length > 0) {
            // Distribute across locations for visualizer
            locMap[internalLocs[0].id].totalQuantity = Math.max(0, totalAssigned);
          }
        }

        setLocationBalances(Object.values(locMap));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const filteredDocs = pendingDocs.filter((doc) => {
    if (activeTab !== 'ALL' && doc.type !== activeTab) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <h1 className="text-base sm:text-lg font-mono font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <span>INVENTORY OPERATIONS DASHBOARD</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xs">
              LIVE SUPABASE SYNC
            </span>
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Operational snapshot of warehouse inventory, document dispatch pipelines, and ledger throughput.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            isLoading={isLoading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Link href="/receipts?action=new">
            <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Receive Stock
            </Button>
          </Link>

          <Link href="/deliveries?action=new">
            <Button variant="secondary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Deliver Stock
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <KpiBlock
          label="Total Products"
          value={kpis?.total_products ?? 0}
          subtext="Catalog items"
          icon={<Boxes className="w-4 h-4 text-stone-500" />}
          href="/products"
        />

        <KpiBlock
          label="Low / Out of Stock"
          value={(kpis?.low_stock_items ?? 0) + (kpis?.out_of_stock_items ?? 0)}
          subtext={`${kpis?.out_of_stock_items ?? 0} out of stock`}
          variant={((kpis?.low_stock_items ?? 0) + (kpis?.out_of_stock_items ?? 0)) > 0 ? 'amber' : 'default'}
          alert={((kpis?.low_stock_items ?? 0) + (kpis?.out_of_stock_items ?? 0)) > 0}
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          href="/products?filter=low_stock"
        />

        <KpiBlock
          label="Pending Receipts"
          value={kpis?.pending_receipts ?? 0}
          subtext="Inbound from suppliers"
          variant="blue"
          icon={<ArrowDownLeft className="w-4 h-4 text-blue-600" />}
          href="/receipts"
        />

        <KpiBlock
          label="Pending Deliveries"
          value={kpis?.pending_deliveries ?? 0}
          subtext="Outbound customer orders"
          variant="emerald"
          icon={<ArrowUpRight className="w-4 h-4 text-emerald-600" />}
          href="/deliveries"
        />

        <KpiBlock
          label="Internal Transfers"
          value={kpis?.internal_transfers_scheduled ?? 0}
          subtext="Bin movements"
          icon={<ArrowLeftRight className="w-4 h-4 text-stone-600" />}
          href="/transfers"
        />
      </div>

      {/* Visual Analytics Strip: Operations Status Flow & Category Stock Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Operations Activity Flow Chart */}
        <div className="lg:col-span-2">
          <Panel
            title="OPERATIONS DISPATCH THROUGHPUT"
            subtitle="Live status comparison across document workflows"
            density="compact"
          >
            <OpsFlowChart statusCounts={docCounts} />
          </Panel>
        </div>

        {/* Category Stock Distribution Visualizer */}
        <div className="lg:col-span-1">
          <Panel
            title="INVENTORY BY CATEGORY"
            subtitle="Unit volume distribution"
            density="compact"
          >
            <StockDistributionChart data={categoryShares} />
          </Panel>
        </div>
      </div>

      {/* Action Queue & Segmented Filter */}
      <Panel
        title="OPERATIONAL WORK QUEUE"
        subtitle="Documents awaiting picking, packing, shelving, or validation"
        density="none"
        action={
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-sm border border-stone-200">
            {(['ALL', 'RECEIPT', 'DELIVERY', 'TRANSFER'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded-xs transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white font-bold text-stone-900 shadow-xs border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab === 'RECEIPT' ? 'Receipts' : tab === 'DELIVERY' ? 'Deliveries' : 'Transfers'}
              </button>
            ))}
          </div>
        }
      >
        <Table>
          <TableHeader>
            <tr>
              <TableHead>REFERENCE</TableHead>
              <TableHead>TYPE</TableHead>
              <TableHead>PARTNER / LOCATION</TableHead>
              <TableHead>SCHEDULED DATE</TableHead>
              <TableHead>LINES</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead align="right">ACTION</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filteredDocs.length === 0 ? (
              <TableEmptyState
                colSpan={7}
                message="No pending documents in queue. All stock operations are up to date."
              />
            ) : (
              filteredDocs.slice(0, 8).map((doc) => {
                const partner = doc.Contact?.name || (doc.source_location ? `${doc.source_location.name} → ${doc.destination_location?.name || ''}` : 'Internal');
                return (
                  <TableRow key={doc.id}>
                    <TableCell isMonospace className="font-bold text-stone-900">
                      <Link href={`${doc.urlPrefix}?id=${doc.id}`} className="hover:text-amber-600 hover:underline">
                        {doc.reference}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[11px] text-stone-700">
                        {doc.type.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-stone-700 text-xs truncate max-w-[200px]">
                      {partner}
                    </TableCell>
                    <TableCell isMonospace className="text-stone-600 text-[11px]">
                      {formatDate(doc.scheduleDate)}
                    </TableCell>
                    <TableCell isMonospace className="text-stone-700">
                      {doc.lines?.length || 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant={doc.status} size="sm" showDot />
                    </TableCell>
                    <TableCell align="right">
                      <Link href={`${doc.urlPrefix}?id=${doc.id}`}>
                        <Button size="xs" variant={doc.status === 'DRAFT' ? 'primary' : 'outline'}>
                          {doc.status === 'DRAFT' ? 'Validate' : 'View'}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Panel>

      {/* Two Column Grid: Stock Ledger Stream & Warehouse Location Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel
            title="REAL-TIME STOCK LEDGER STREAM"
            subtitle="Latest validated transactions recorded in database"
            density="none"
            action={
              <Link href="/ledger" className="text-xs font-mono text-amber-600 hover:underline flex items-center gap-1">
                <span>Full Audit Log</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            }
          >
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>TIME</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>PRODUCT</TableHead>
                  <TableHead>ROUTE</TableHead>
                  <TableHead align="right">QUANTITY</TableHead>
                  <TableHead>REF</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {recentMovements.length === 0 ? (
                  <TableEmptyState colSpan={6} message="No recent stock movements recorded in database." />
                ) : (
                  recentMovements.slice(0, 6).map((m) => (
                    <TableRow key={m.id} isInteractive={false}>
                      <TableCell isMonospace className="text-[11px] text-stone-500 whitespace-nowrap">
                        {formatDate(m.createdAt, true)}
                      </TableCell>
                      <TableCell isMonospace className="font-semibold text-stone-900">
                        {m.Product?.sku || '—'}
                      </TableCell>
                      <TableCell className="text-stone-700 text-xs truncate max-w-[160px]">
                        {m.Product?.name || '—'}
                      </TableCell>
                      <TableCell isMonospace className="text-[11px] text-stone-600">
                        {m.source_location?.name || 'Vendor'} → {m.destination_location?.name || 'Customer'}
                      </TableCell>
                      <TableCell align="right" isMonospace className="font-bold text-stone-900">
                        {m.quantity}
                      </TableCell>
                      <TableCell isMonospace className="text-[11px] text-stone-500">
                        {m.StockDocument?.reference || '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Panel>
        </div>

        <div className="lg:col-span-1">
          <Panel
            title="STORAGE LOCATION CAPACITY"
            subtitle="Stock distribution across warehouse bins"
            density="compact"
          >
            <LocationCapacityBars locations={locationBalances} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
