'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Plus, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  AlertTriangle, 
  Scale, 
  ArrowUp, 
  ArrowDown, 
  MapPin,
  ClipboardList
} from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmptyState } from '@/components/ui/Table';
import { getStockAdjustments, createStockAdjustment, getLocations } from '@/app/actions/stock';
import { getProducts, getProductStockByLocation } from '@/app/actions/products';
import { StockDocumentWithDetails, ProductWithDetails, Location } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function AdjustmentsView() {
  const [adjustments, setAdjustments] = useState<StockDocumentWithDetails[]>([]);
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Adjustment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [currentSystemQty, setCurrentSystemQty] = useState<number>(0);
  const [countedQty, setCountedQty] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [adjRes, prodRes, locRes] = await Promise.all([
        getStockAdjustments(),
        getProducts(),
        getLocations(),
      ]);

      if (adjRes.success && adjRes.data) setAdjustments(adjRes.data);
      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
        if (!selectedProductId && prodRes.data.length > 0) {
          setSelectedProductId(prodRes.data[0].id);
        }
      }
      if (locRes.success && locRes.data) {
        const internalLocs = locRes.data.filter((l) => l.type === 'INTERNAL');
        setLocations(internalLocs);
        if (!selectedLocationId && internalLocs.length > 0) {
          setSelectedLocationId(internalLocs[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading adjustments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update current system quantity when product or location changes
  useEffect(() => {
    const fetchCurrentQty = async () => {
      if (!selectedProductId) return;
      try {
        const res = await getProductStockByLocation(selectedProductId);
        if (res.success && res.data) {
          const locStock = res.data.find((l) => l.location_id === selectedLocationId);
          const qty = locStock?.quantity || 0;
          setCurrentSystemQty(qty);
          setCountedQty(qty); // Default counted to current system qty
        } else {
          setCurrentSystemQty(0);
          setCountedQty(0);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCurrentQty();
  }, [selectedProductId, selectedLocationId]);

  const delta = countedQty - currentSystemQty;

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (delta === 0) {
      alert('Counted quantity equals current recorded quantity. No adjustment needed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createStockAdjustment(
        selectedProductId,
        selectedLocationId,
        Number(countedQty),
        notes || undefined
      );

      if (res.success) {
        setSuccessMsg(res.message || 'Stock adjustment recorded successfully.');
        setIsModalOpen(false);
        setNotes('');
        loadData();
      } else {
        alert(res.error || 'Failed to record adjustment');
      }
    } catch (err) {
      alert('Error creating adjustment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-300">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-mono font-bold uppercase tracking-wider text-stone-900">
              INVENTORY ADJUSTMENT & CYCLE COUNTING
            </h1>
            <span className="text-[11px] font-mono px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300">
              STOCK RECONCILIATION
            </span>
          </div>
          <p className="text-xs font-mono text-stone-500 mt-0.5">
            Fix mismatches between physical stock counts and system records. Discrepancies are permanently recorded in the ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            REFRESH
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            NEW PHYSICAL COUNT / ADJUSTMENT
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4 text-stone-400 hover:text-stone-800" />
          </button>
        </div>
      )}

      {/* Adjustments Table */}
      <Panel
        title="RECONCILIATION & ADJUSTMENT LOG"
        subtitle="Historical inventory corrections, cycle count audits, and damaged write-offs"
        density="none"
      >
        <Table>
          <TableHeader>
            <tr>
              <TableHead>REFERENCE</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>LOCATION</TableHead>
              <TableHead>PRODUCT / SKU</TableHead>
              <TableHead align="right">ADJUSTED QTY</TableHead>
              <TableHead>REASON / NOTES</TableHead>
              <TableHead>STATUS</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {adjustments.length === 0 ? (
              <TableEmptyState
                colSpan={7}
                message="No inventory adjustments recorded. Recorded stock matches ledger counts."
              />
            ) : (
              adjustments.map((adj) => {
                const line = adj.lines?.[0];
                return (
                  <TableRow key={adj.id} isInteractive={false}>
                    <TableCell isMonospace className="font-bold text-stone-900">
                      {adj.reference}
                    </TableCell>
                    <TableCell isMonospace className="text-[11px] text-stone-600">
                      {formatDate(adj.scheduleDate || adj.createdAt, true)}
                    </TableCell>
                    <TableCell isMonospace className="text-stone-700 font-medium">
                      {adj.destination_location?.name || 'WH/Stock'}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs font-semibold text-stone-900">
                        {line?.Product?.name || '—'}
                      </div>
                      <div className="font-mono text-[10px] text-stone-500">
                        SKU: {line?.Product?.sku || '—'}
                      </div>
                    </TableCell>
                    <TableCell align="right" isMonospace className="font-bold text-stone-900">
                      {line?.quantity ? `±${line.quantity}` : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-stone-600 max-w-[240px] truncate">
                      {adj.notes || 'Routine cycle count adjustment'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="DONE" size="sm">RECONCILED</Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Panel>

      {/* New Count Adjustment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="RECORD PHYSICAL INVENTORY COUNT"
        subtitle="Reconcile system on-hand records with actual warehouse bin count"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              CANCEL
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={delta === 0}
              onClick={handleSubmitAdjustment}
            >
              POST RECONCILIATION DELTA
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitAdjustment} className="space-y-3 font-mono text-xs">
          <Select
            label="Product / SKU to Count *"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.sku}] {p.name}
              </option>
            ))}
          </Select>

          <Select
            label="Warehouse Location / Bin *"
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            required
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} [{l.shortCode}]
              </option>
            ))}
          </Select>

          {/* Real-time Delta Calculator Display */}
          <div className="p-3 bg-stone-100 border border-stone-300 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white border border-stone-200">
              <span className="text-[10px] uppercase text-stone-500 font-bold block">Current System</span>
              <span className="text-base font-bold text-stone-800">{currentSystemQty}</span>
            </div>

            <div className="p-2 bg-white border border-stone-200">
              <span className="text-[10px] uppercase text-stone-500 font-bold block">Physical Count</span>
              <span className="text-base font-bold text-stone-900">{countedQty}</span>
            </div>

            <div className={`p-2 border ${
              delta > 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : delta < 0
                ? 'bg-red-50 border-red-300 text-red-800'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}>
              <span className="text-[10px] uppercase font-bold block">Adjustment Delta</span>
              <span className="text-base font-bold flex items-center justify-center gap-1">
                {delta > 0 ? (
                  <>
                    <ArrowUp className="w-3.5 h-3.5" />
                    +{delta}
                  </>
                ) : delta < 0 ? (
                  <>
                    <ArrowDown className="w-3.5 h-3.5" />
                    {delta}
                  </>
                ) : (
                  '0 (Exact)'
                )}
              </span>
            </div>
          </div>

          <Input
            label="Enter Verified Physical Count *"
            type="number"
            min="0"
            value={countedQty}
            onChange={(e) => setCountedQty(Number(e.target.value))}
            required
          />

          <Input
            label="Audit Notes / Reason for Discrepancy"
            placeholder="e.g. Broken items found during weekly cycle count / miscount in last PO"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}

