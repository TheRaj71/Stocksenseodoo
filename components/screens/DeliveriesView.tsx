'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowUpRight, 
  Plus, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  MapPin, 
  Trash2,
  AlertTriangle,
  TrendingDown,
  UserCheck
} from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { StatusStepper, DocStepStatus } from '@/components/ui/StatusStepper';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmptyState } from '@/components/ui/Table';
import { 
  getDeliveries, 
  getDeliveryById, 
  createDelivery, 
  addDeliveryLine, 
  deleteDeliveryLine, 
  validateDelivery, 
  cancelDelivery,
  getCustomers 
} from '@/app/actions/deliveries';
import { getProducts } from '@/app/actions/products';
import { getLocations } from '@/app/actions/stock';
import { StockDocumentWithDetails, Contact, ProductWithDetails, Location } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function DeliveriesView() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');
  const actionParam = searchParams.get('action');

  const [deliveries, setDeliveries] = useState<StockDocumentWithDetails[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<StockDocumentWithDetails | null>(null);
  const [customers, setCustomers] = useState<Contact[]>([]);
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validationSuccessMsg, setValidationSuccessMsg] = useState<string | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Create Delivery Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(actionParam === 'new');
  const [createForm, setCreateForm] = useState({
    contactId: '',
    sourceLocationId: '',
    scheduleDate: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  // Add Line Modal
  const [isAddLineModalOpen, setIsAddLineModalOpen] = useState(false);
  const [lineForm, setLineForm] = useState({
    productId: '',
    quantity: 1,
    sourceLocationId: '',
  });
  const [lineError, setLineError] = useState<string | null>(null);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [delRes, custRes, prodRes, locRes] = await Promise.all([
        getDeliveries({
          status: statusFilter !== 'ALL' ? (statusFilter as any) : undefined,
        }),
        getCustomers(),
        getProducts(),
        getLocations(),
      ]);

      if (delRes.success && delRes.data) {
        setDeliveries(delRes.data);
        if (targetId) {
          const matched = delRes.data.find((d) => d.id === targetId);
          if (matched) setSelectedDelivery(matched);
        } else if (!selectedDelivery && delRes.data.length > 0) {
          setSelectedDelivery(delRes.data[0]);
        }
      }
      if (custRes.success && custRes.data) {
        setCustomers(custRes.data);
        if (!createForm.contactId && custRes.data.length > 0) {
          setCreateForm((f) => ({ ...f, contactId: custRes.data![0].id }));
        }
      }
      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
        if (!lineForm.productId && prodRes.data.length > 0) {
          setLineForm((f) => ({ ...f, productId: prodRes.data![0].id }));
        }
      }
      if (locRes.success && locRes.data) {
        const internalLocs = locRes.data.filter((l) => l.type === 'INTERNAL');
        setLocations(internalLocs);
        if (!createForm.sourceLocationId && internalLocs.length > 0) {
          setCreateForm((f) => ({ ...f, sourceLocationId: internalLocs[0].id }));
          setLineForm((f) => ({ ...f, sourceLocationId: internalLocs[0].id }));
        }
      }
    } catch (err) {
      console.error('Error loading deliveries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [statusFilter, targetId]);

  // Handle Validate Delivery
  const handleValidate = async () => {
    if (!selectedDelivery) return;
    setIsValidating(true);
    setValidationSuccessMsg(null);
    try {
      const res = await validateDelivery(selectedDelivery.id);
      if (res.success && res.data) {
        setValidationSuccessMsg(`Delivery ${selectedDelivery.reference} validated! Stock decreased automatically.`);
        const updated = await getDeliveryById(selectedDelivery.id);
        if (updated.success && updated.data) {
          setSelectedDelivery(updated.data);
        }
        loadAllData();
      } else {
        alert(res.error || 'Failed to validate delivery');
      }
    } catch (err) {
      alert('Error validating delivery');
    } finally {
      setIsValidating(false);
    }
  };

  // Handle Cancel
  const handleCancel = async () => {
    if (!selectedDelivery) return;
    if (!confirm('Cancel this delivery order?')) return;
    const res = await cancelDelivery(selectedDelivery.id);
    if (res.success) {
      loadAllData();
      if (selectedDelivery) {
        setSelectedDelivery({ ...selectedDelivery, status: 'CANCELLED' });
      }
    }
  };

  // Create Delivery Order
  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createDelivery({
        contactId: createForm.contactId || null,
        sourceLocationId: createForm.sourceLocationId || null,
        scheduleDate: new Date(createForm.scheduleDate).toISOString(),
        notes: createForm.notes,
      });

      if (res.success && res.data) {
        setIsCreateModalOpen(false);
        loadAllData();
        setSelectedDelivery(res.data as any);
      } else {
        alert(res.error || 'Failed to create delivery');
      }
    } catch (err) {
      alert('Error creating delivery');
    }
  };

  // Add Delivery Line Item
  const handleAddLine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery) return;
    setLineError(null);

    try {
      const res = await addDeliveryLine(selectedDelivery.id, {
        productId: lineForm.productId,
        quantity: Number(lineForm.quantity),
        sourceLocationId: lineForm.sourceLocationId || selectedDelivery.sourceLocationId,
      });

      if (res.success) {
        setIsAddLineModalOpen(false);
        const updated = await getDeliveryById(selectedDelivery.id);
        if (updated.success && updated.data) {
          setSelectedDelivery(updated.data);
        }
        loadAllData();
      } else {
        setLineError(res.error || 'Failed to add item (insufficient stock?)');
      }
    } catch (err) {
      setLineError('Unexpected error adding item');
    }
  };

  // Delete Delivery Line Item
  const handleDeleteLine = async (lineId: string) => {
    if (!selectedDelivery) return;
    if (!confirm('Remove this line item?')) return;
    const res = await deleteDeliveryLine(lineId);
    if (res.success) {
      const updated = await getDeliveryById(selectedDelivery.id);
      if (updated.success && updated.data) {
        setSelectedDelivery(updated.data);
      }
      loadAllData();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-300">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-mono font-bold uppercase tracking-wider text-stone-900">
              OUTGOING SHIPMENTS (DELIVERY ORDERS)
            </h1>
            <span className="text-[11px] font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300">
              CUSTOMER DISPATCH
            </span>
          </div>
          <p className="text-xs font-mono text-stone-500 mt-0.5">
            Pick, pack, and validate customer shipments. System automatically checks inventory sufficiency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            isLoading={isLoading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            REFRESH
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            NEW DELIVERY ORDER
          </Button>
        </div>
      </div>

      {/* Validation Feedback Banner */}
      {validationSuccessMsg && (
        <div className="p-3 bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">{validationSuccessMsg}</span>
          </div>
          <button onClick={() => setValidationSuccessMsg(null)}>
            <X className="w-4 h-4 text-stone-400 hover:text-stone-800" />
          </button>
        </div>
      )}

      {/* Master-Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Deliveries List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between bg-stone-50 p-2 border border-stone-300">
            <span className="text-[11px] font-mono text-stone-600 font-bold uppercase">
              STATUS:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-stone-300 text-xs px-2 py-0.5 font-mono focus:outline-none"
            >
              <option value="ALL">ALL DELIVERIES ({deliveries.length})</option>
              <option value="DRAFT">DRAFT (PENDING DISPATCH)</option>
              <option value="DONE">DONE (SHIPPED)</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="space-y-1.5 max-h-[calc(100vh-14rem)] overflow-y-auto">
            {deliveries.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-stone-500 bg-white border border-stone-200">
                [ NO DELIVERIES MATCHING FILTER ]
              </div>
            ) : (
              deliveries.map((d) => {
                const isSelected = selectedDelivery?.id === d.id;

                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      setSelectedDelivery(d);
                      setValidationSuccessMsg(null);
                    }}
                    className={`p-3 border transition-all cursor-pointer font-mono text-xs ${
                      isSelected
                        ? 'bg-white border-stone-900 border-l-[4px] border-l-emerald-600 ring-1 ring-stone-900 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">{d.reference}</span>
                      <Badge variant={d.status} size="sm" showDot />
                    </div>

                    <div className="mt-1 flex items-center justify-between text-stone-600 text-[11px]">
                      <span className="font-medium truncate max-w-[180px]">
                        {d.Contact?.name || 'Customer Shipment'}
                      </span>
                      <span>{formatDate(d.scheduleDate)}</span>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                      <span>Source: <strong>{d.source_location?.name || 'WH/Stock'}</strong></span>
                      <span>{d.lines?.length || 0} line item(s)</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Delivery Details & Pick/Pack Stepper */}
        <div className="lg:col-span-7">
          {selectedDelivery ? (
            <Panel
              title={`DELIVERY CONSOLE: ${selectedDelivery.reference}`}
              density="none"
              statusBorder={selectedDelivery.status as any}
              action={
                <div className="flex items-center gap-2">
                  {selectedDelivery.status === 'DRAFT' && (
                    <>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        CANCEL
                      </Button>
                      <Button
                        size="xs"
                        variant="primary"
                        isLoading={isValidating}
                        onClick={handleValidate}
                        disabled={(selectedDelivery.lines?.length || 0) === 0}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        VALIDATE & DISPATCH
                      </Button>
                    </>
                  )}
                  {selectedDelivery.status === 'DONE' && (
                    <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                      SHIPPED ON {formatDate(selectedDelivery.doneDate || selectedDelivery.createdAt)}
                    </span>
                  )}
                </div>
              }
            >
              {/* Stepper Header */}
              <div className="p-3 bg-stone-50 border-b border-stone-200">
                <StatusStepper currentStatus={selectedDelivery.status as DocStepStatus} />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-stone-200 font-mono text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 font-semibold block">Customer</span>
                    <span className="font-bold text-stone-900">{selectedDelivery.Contact?.name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 font-semibold block">Pick Location</span>
                    <span className="font-bold text-stone-900">{selectedDelivery.source_location?.name || 'WH/Stock'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 font-semibold block">Scheduled Date</span>
                    <span className="text-stone-900">{formatDate(selectedDelivery.scheduleDate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 font-semibold block">Validated At</span>
                    <span className="text-stone-900">{selectedDelivery.validatedAt ? formatDate(selectedDelivery.validatedAt, true) : 'Pending'}</span>
                  </div>
                </div>

                {selectedDelivery.notes && (
                  <div className="mt-2 text-[11px] font-mono text-stone-600 bg-white p-2 border border-stone-200">
                    <strong>Notes / Sales Ref:</strong> {selectedDelivery.notes}
                  </div>
                )}
              </div>

              {/* Line Items Table with Stock Sufficiency & Negative Impact */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-stone-700">
                    SHIPMENT ITEMS ({selectedDelivery.lines?.length || 0})
                  </span>
                  {selectedDelivery.status === 'DRAFT' && (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setIsAddLineModalOpen(true)}
                      icon={<Plus className="w-3 h-3" />}
                    >
                      ADD PRODUCT LINE
                    </Button>
                  )}
                </div>

                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>SKU</TableHead>
                      <TableHead>PRODUCT</TableHead>
                      <TableHead align="right">ORDER QTY</TableHead>
                      <TableHead>UOM</TableHead>
                      <TableHead align="right">STOCK IMPACT</TableHead>
                      {selectedDelivery.status === 'DRAFT' && <TableHead align="right">ACTION</TableHead>}
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {(!selectedDelivery.lines || selectedDelivery.lines.length === 0) ? (
                      <TableEmptyState
                        colSpan={6}
                        message="No products attached to this shipment. Click 'ADD PRODUCT LINE' to pack items."
                      />
                    ) : (
                      selectedDelivery.lines.map((line) => {
                        const matchedProduct = products.find((p) => p.id === line.productId);
                        const currentStock = matchedProduct?.stock_quantity ?? 0;
                        const projectedStock = currentStock - line.quantity;
                        const hasInsufficientStock = line.quantity > currentStock;

                        return (
                          <TableRow key={line.id} isInteractive={false}>
                            <TableCell isMonospace className="font-bold text-stone-900">
                              <span className="px-1.5 py-0.5 bg-stone-900 text-amber-400 font-bold text-[11px]">
                                {line.Product?.sku || matchedProduct?.sku || '—'}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium text-stone-900">
                              {line.Product?.name || matchedProduct?.name || '—'}
                            </TableCell>
                            <TableCell align="right" isMonospace className="font-bold text-red-700 text-sm">
                              -{line.quantity}
                            </TableCell>
                            <TableCell isMonospace className="text-stone-600 text-[11px]">
                              {(line.Product as any)?.UnitOfMeasure?.abbreviation || (matchedProduct as any)?.UnitOfMeasure?.symbol || 'pcs'}
                            </TableCell>
                            <TableCell align="right" isMonospace className="text-[11px]">
                              {selectedDelivery.status === 'DRAFT' ? (
                                hasInsufficientStock ? (
                                  <span className="inline-flex items-center gap-1 text-red-700 font-bold bg-red-100 px-1.5 py-0.5 border border-red-300">
                                    <AlertTriangle className="w-3 h-3" />
                                    SHORTAGE ({currentStock} avail)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-stone-800 font-semibold bg-stone-100 px-1.5 py-0.5 border border-stone-200">
                                    <TrendingDown className="w-3 h-3 text-red-600" />
                                    {currentStock} → {projectedStock}
                                  </span>
                                )
                              ) : (
                                <span className="text-stone-500 font-bold">DISPATCHED</span>
                              )}
                            </TableCell>
                            {selectedDelivery.status === 'DRAFT' && (
                              <TableCell align="right">
                                <button
                                  onClick={() => handleDeleteLine(line.id)}
                                  className="text-stone-400 hover:text-red-700 p-1 cursor-pointer"
                                  title="Remove line"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Panel>
          ) : (
            <div className="p-12 text-center text-xs font-mono text-stone-500 bg-white border border-stone-200">
              [ SELECT A DELIVERY ORDER ON THE LEFT TO VIEW DETAILS ]
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Delivery */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="CREATE DELIVERY ORDER (OUTBOUND DISPATCH)"
        subtitle="Initialize outgoing customer shipment"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateDelivery}>
              CREATE DRAFT DELIVERY
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateDelivery} className="space-y-3 font-mono text-xs">
          <Select
            label="Customer Contact *"
            value={createForm.contactId}
            onChange={(e) => setCreateForm({ ...createForm, contactId: e.target.value })}
            required
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email || 'No email'})
              </option>
            ))}
          </Select>

          <Select
            label="Source Picking Location *"
            value={createForm.sourceLocationId}
            onChange={(e) => setCreateForm({ ...createForm, sourceLocationId: e.target.value })}
            required
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} [{l.shortCode}]
              </option>
            ))}
          </Select>

          <Input
            label="Scheduled Ship Date & Time *"
            type="datetime-local"
            value={createForm.scheduleDate}
            onChange={(e) => setCreateForm({ ...createForm, scheduleDate: e.target.value })}
            required
          />

          <Input
            label="Sales Order / Customer PO Reference"
            placeholder="e.g. SO-99120 — Customer Express Delivery"
            value={createForm.notes}
            onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
          />
        </form>
      </Modal>

      {/* Modal: Add Delivery Line */}
      <Modal
        isOpen={isAddLineModalOpen}
        onClose={() => setIsAddLineModalOpen(false)}
        title="ADD ITEM TO SHIPMENT"
        subtitle={`Delivery: ${selectedDelivery?.reference}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddLineModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddLine}>
              ADD ITEM
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddLine} className="space-y-3 font-mono text-xs">
          {lineError && (
            <div className="p-2 bg-red-100 border border-red-400 text-red-800 font-semibold text-xs">
              {lineError}
            </div>
          )}

          <Select
            label="Select Product / SKU *"
            value={lineForm.productId}
            onChange={(e) => setLineForm({ ...lineForm, productId: e.target.value })}
            required
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.sku}] {p.name} (Available: {p.stock_quantity ?? 0} {(p as any).UnitOfMeasure?.symbol || 'pcs'})
              </option>
            ))}
          </Select>

          <Input
            label="Quantity to Ship *"
            type="number"
            min="1"
            value={lineForm.quantity}
            onChange={(e) => setLineForm({ ...lineForm, quantity: Number(e.target.value) })}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
