'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowDownLeft, 
  Plus, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Truck, 
  Calendar, 
  MapPin, 
  FileText,
  Trash2,
  AlertCircle,
  TrendingUp,
  Building
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
  getReceipts, 
  getReceiptById, 
  createReceipt, 
  addReceiptLine, 
  deleteReceiptLine, 
  validateReceipt, 
  cancelReceipt,
  getSuppliers 
} from '@/app/actions/receipts';
import { getProducts } from '@/app/actions/products';
import { getLocations } from '@/app/actions/stock';
import { StockDocumentWithDetails, Contact, ProductWithDetails, Location } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function ReceiptsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetId = searchParams.get('id');
  const actionParam = searchParams.get('action');

  const [receipts, setReceipts] = useState<StockDocumentWithDetails[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<StockDocumentWithDetails | null>(null);
  const [suppliers, setSuppliers] = useState<Contact[]>([]);
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validationSuccessMsg, setValidationSuccessMsg] = useState<string | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Create Receipt Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(actionParam === 'new');
  const [createForm, setCreateForm] = useState({
    contactId: '',
    destLocationId: '',
    scheduleDate: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  // Add Line Modal
  const [isAddLineModalOpen, setIsAddLineModalOpen] = useState(false);
  const [lineForm, setLineForm] = useState({
    productId: '',
    quantity: 10,
    destLocationId: '',
  });
  const [lineError, setLineError] = useState<string | null>(null);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [recRes, supRes, prodRes, locRes] = await Promise.all([
        getReceipts({
          status: statusFilter !== 'ALL' ? (statusFilter as any) : undefined,
        }),
        getSuppliers(),
        getProducts(),
        getLocations(),
      ]);

      if (recRes.success && recRes.data) {
        setReceipts(recRes.data);
        // If targetId is provided in URL, select that receipt
        if (targetId) {
          const matched = recRes.data.find((r) => r.id === targetId);
          if (matched) setSelectedReceipt(matched);
        } else if (!selectedReceipt && recRes.data.length > 0) {
          // Default select the first pending receipt
          setSelectedReceipt(recRes.data[0]);
        }
      }
      if (supRes.success && supRes.data) {
        setSuppliers(supRes.data);
        if (!createForm.contactId && supRes.data.length > 0) {
          setCreateForm((f) => ({ ...f, contactId: supRes.data![0].id }));
        }
      }
      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
        if (!lineForm.productId && prodRes.data.length > 0) {
          setLineForm((f) => ({ ...f, productId: prodRes.data![0].id }));
        }
      }
      if (locRes.success && locRes.data) {
        // Filter for internal locations
        const internalLocs = locRes.data.filter((l) => l.type === 'INTERNAL');
        setLocations(internalLocs);
        if (!createForm.destLocationId && internalLocs.length > 0) {
          setCreateForm((f) => ({ ...f, destLocationId: internalLocs[0].id }));
          setLineForm((f) => ({ ...f, destLocationId: internalLocs[0].id }));
        }
      }
    } catch (err) {
      console.error('Error loading receipts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [statusFilter, targetId]);

  // Handle Validate Receipt action
  const handleValidate = async () => {
    if (!selectedReceipt) return;
    setIsValidating(true);
    setValidationSuccessMsg(null);
    try {
      const res = await validateReceipt(selectedReceipt.id);
      if (res.success && res.data) {
        setValidationSuccessMsg(`Receipt ${selectedReceipt.reference} validated! Stock increased automatically.`);
        // Reload details
        const updated = await getReceiptById(selectedReceipt.id);
        if (updated.success && updated.data) {
          setSelectedReceipt(updated.data);
        }
        loadAllData();
      } else {
        alert(res.error || 'Failed to validate receipt');
      }
    } catch (err) {
      alert('Error validating receipt');
    } finally {
      setIsValidating(false);
    }
  };

  // Handle Cancel Receipt action
  const handleCancel = async () => {
    if (!selectedReceipt) return;
    if (!confirm('Are you sure you want to cancel this receipt?')) return;
    const res = await cancelReceipt(selectedReceipt.id);
    if (res.success) {
      loadAllData();
      if (selectedReceipt) {
        setSelectedReceipt({ ...selectedReceipt, status: 'CANCELLED' });
      }
    }
  };

  // Submit Create Receipt
  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createReceipt({
        contactId: createForm.contactId || null,
        destLocationId: createForm.destLocationId || null,
        scheduleDate: new Date(createForm.scheduleDate).toISOString(),
        notes: createForm.notes,
      });

      if (res.success && res.data) {
        setIsCreateModalOpen(false);
        loadAllData();
        setSelectedReceipt(res.data as any);
      } else {
        alert(res.error || 'Failed to create receipt');
      }
    } catch (err) {
      alert('Error creating receipt');
    }
  };

  // Submit Add Line Item
  const handleAddLine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceipt) return;
    setLineError(null);

    try {
      const res = await addReceiptLine(selectedReceipt.id, {
        productId: lineForm.productId,
        quantity: Number(lineForm.quantity),
        destLocationId: lineForm.destLocationId || selectedReceipt.destLocationId,
      });

      if (res.success) {
        setIsAddLineModalOpen(false);
        // Refresh selected receipt
        const updated = await getReceiptById(selectedReceipt.id);
        if (updated.success && updated.data) {
          setSelectedReceipt(updated.data);
        }
        loadAllData();
      } else {
        setLineError(res.error || 'Failed to add line item');
      }
    } catch (err) {
      setLineError('Unexpected error adding line');
    }
  };

  // Delete Line Item
  const handleDeleteLine = async (lineId: string) => {
    if (!selectedReceipt) return;
    if (!confirm('Remove this line item?')) return;
    const res = await deleteReceiptLine(lineId);
    if (res.success) {
      const updated = await getReceiptById(selectedReceipt.id);
      if (updated.success && updated.data) {
        setSelectedReceipt(updated.data);
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
              INCOMING SHIPMENTS (RECEIPTS)
            </h1>
            <span className="text-[11px] font-mono px-1.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-300">
              VENDOR INTAKE
            </span>
          </div>
          <p className="text-xs font-mono text-stone-500 mt-0.5">
            Receive goods from suppliers, check quantities against purchase orders, and validate into stock.
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
            NEW INCOMING RECEIPT
          </Button>
        </div>
      </div>

      {/* Validation Success Feedback Banner */}
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
        {/* Left Side: Receipts Ledger List */}
        <div className="lg:col-span-5 space-y-2">
          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-stone-50 p-2 border border-stone-300">
            <span className="text-[11px] font-mono text-stone-600 font-bold uppercase">
              STATUS:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-stone-300 text-xs px-2 py-0.5 font-mono focus:outline-none"
            >
              <option value="ALL">ALL RECEIPTS ({receipts.length})</option>
              <option value="DRAFT">DRAFT (PENDING VALIDATION)</option>
              <option value="DONE">DONE (COMMITTED)</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="space-y-1.5 max-h-[calc(100vh-14rem)] overflow-y-auto">
            {receipts.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-stone-500 bg-white border border-stone-200">
                [ NO RECEIPTS MATCHING FILTER ]
              </div>
            ) : (
              receipts.map((r) => {
                const isSelected = selectedReceipt?.id === r.id;
                const isDone = r.status === 'DONE';

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedReceipt(r);
                      setValidationSuccessMsg(null);
                    }}
                    className={`p-3 border transition-all cursor-pointer font-mono text-xs ${
                      isSelected
                        ? 'bg-white border-stone-900 border-l-[4px] border-l-amber-600 ring-1 ring-stone-900 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">{r.reference}</span>
                      <Badge variant={r.status} size="sm" showDot />
                    </div>

                    <div className="mt-1 flex items-center justify-between text-stone-600 text-[11px]">
                      <span className="font-medium truncate max-w-[180px]">
                        {r.Contact?.name || 'Unknown Supplier'}
                      </span>
                      <span>{formatDate(r.scheduleDate)}</span>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                      <span>Dest: <strong>{r.destination_location?.name || 'WH/Stock'}</strong></span>
                      <span>{r.lines?.length || 0} line item(s)</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Workstation Console & Line Item Ledger */}
        <div className="lg:col-span-7">
          {selectedReceipt ? (
            <Panel
              title={`RECEIPT CONSOLE: ${selectedReceipt.reference}`}
              density="none"
              statusBorder={selectedReceipt.status as any}
              action={
                <div className="flex items-center gap-2">
                  {selectedReceipt.status === 'DRAFT' && (
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
                        disabled={(selectedReceipt.lines?.length || 0) === 0}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        VALIDATE & COMMIT STOCK
                      </Button>
                    </>
                  )}
                  {selectedReceipt.status === 'DONE' && (
                    <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                      COMMITTED ON {formatDate(selectedReceipt.doneDate || selectedReceipt.createdAt)}
                    </span>
                  )}
                </div>
              }
            >
              {/* Stepper Header */}
              <div className="p-3 bg-stone-50 border-b border-stone-200">
                <StatusStepper currentStatus={selectedReceipt.status as DocStepStatus} />

                {/* Metadata details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-stone-200 font-mono text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 font-semibold block">Supplier</span>
                    <span className="font-bold text-stone-900">{selectedReceipt.Contact?.name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 font-semibold block">Dest Location</span>
                    <span className="font-bold text-stone-900">{selectedReceipt.destination_location?.name || 'WH/Stock'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 font-semibold block">Scheduled Date</span>
                    <span className="text-stone-900">{formatDate(selectedReceipt.scheduleDate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 font-semibold block">Validated At</span>
                    <span className="text-stone-900">{selectedReceipt.validatedAt ? formatDate(selectedReceipt.validatedAt, true) : 'Pending'}</span>
                  </div>
                </div>

                {selectedReceipt.notes && (
                  <div className="mt-2 text-[11px] font-mono text-stone-600 bg-white p-2 border border-stone-200">
                    <strong>Notes:</strong> {selectedReceipt.notes}
                  </div>
                )}
              </div>

              {/* Line Items Table with Live Stock Impact Preview */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-stone-700">
                    LINE ITEMS ({selectedReceipt.lines?.length || 0})
                  </span>
                  {selectedReceipt.status === 'DRAFT' && (
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
                      <TableHead>PRODUCT DESCRIPTION</TableHead>
                      <TableHead align="right">RECV QTY</TableHead>
                      <TableHead>UOM</TableHead>
                      <TableHead align="right">STOCK IMPACT</TableHead>
                      {selectedReceipt.status === 'DRAFT' && <TableHead align="right">ACTION</TableHead>}
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {(!selectedReceipt.lines || selectedReceipt.lines.length === 0) ? (
                      <TableEmptyState
                        colSpan={6}
                        message="No products added to this receipt yet. Click 'ADD PRODUCT LINE' to record received items."
                      />
                    ) : (
                      selectedReceipt.lines.map((line) => {
                        const matchedProduct = products.find((p) => p.id === line.productId);
                        const currentStock = matchedProduct?.stock_quantity ?? 0;
                        const projectedStock = currentStock + line.quantity;

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
                            <TableCell align="right" isMonospace className="font-bold text-emerald-700 text-sm">
                              +{line.quantity}
                            </TableCell>
                            <TableCell isMonospace className="text-stone-600 text-[11px]">
                              {(line.Product as any)?.UnitOfMeasure?.abbreviation || (matchedProduct as any)?.UnitOfMeasure?.symbol || 'pcs'}
                            </TableCell>
                            <TableCell align="right" isMonospace className="text-[11px] text-stone-700">
                              {selectedReceipt.status === 'DRAFT' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                                  <TrendingUp className="w-3 h-3" />
                                  {currentStock} → {projectedStock}
                                </span>
                              ) : (
                                <span className="text-stone-500 font-bold">COMMITTED</span>
                              )}
                            </TableCell>
                            {selectedReceipt.status === 'DRAFT' && (
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

                {/* Validation Stock Impact Notice */}
                {selectedReceipt.status === 'DRAFT' && (selectedReceipt.lines?.length || 0) > 0 && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-300 font-mono text-[11px] text-amber-900 flex items-center justify-between">
                    <span>
                      ⚠️ Clicking <strong>VALIDATE & COMMIT STOCK</strong> will execute immediate stock increments into warehouse ledger.
                    </span>
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={handleValidate}
                      isLoading={isValidating}
                    >
                      COMMIT
                    </Button>
                  </div>
                )}
              </div>
            </Panel>
          ) : (
            <div className="p-12 text-center text-xs font-mono text-stone-500 bg-white border border-stone-200">
              [ SELECT A RECEIPT ON THE LEFT TO VIEW DETAILS AND VALIDATE ]
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Receipt */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="CREATE INCOMING RECEIPT (PO INTAKE)"
        subtitle="Initialize incoming shipment document in Draft status"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateReceipt}>
              CREATE DRAFT RECEIPT
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateReceipt} className="space-y-3 font-mono text-xs">
          <Select
            label="Supplier / Vendor Contact *"
            value={createForm.contactId}
            onChange={(e) => setCreateForm({ ...createForm, contactId: e.target.value })}
            required
          >
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email || 'No email'})
              </option>
            ))}
          </Select>

          <Select
            label="Destination Bin / Location *"
            value={createForm.destLocationId}
            onChange={(e) => setCreateForm({ ...createForm, destLocationId: e.target.value })}
            required
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} [{l.shortCode}]
              </option>
            ))}
          </Select>

          <Input
            label="Scheduled Delivery Date & Time *"
            type="datetime-local"
            value={createForm.scheduleDate}
            onChange={(e) => setCreateForm({ ...createForm, scheduleDate: e.target.value })}
            required
          />

          <Input
            label="Internal Notes / PO Reference Number"
            placeholder="e.g. PO-88492 — Steel rods batch A"
            value={createForm.notes}
            onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
          />
        </form>
      </Modal>

      {/* Modal: Add Line Item */}
      <Modal
        isOpen={isAddLineModalOpen}
        onClose={() => setIsAddLineModalOpen(false)}
        title="ADD PRODUCT LINE TO RECEIPT"
        subtitle={`Receipt: ${selectedReceipt?.reference}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddLineModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddLine}>
              ADD ITEM TO LEDGER
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
                [{p.sku}] {p.name} (Current: {p.stock_quantity ?? 0} {(p as any).UnitOfMeasure?.symbol || 'pcs'})
              </option>
            ))}
          </Select>

          <Input
            label="Received Quantity *"
            type="number"
            min="1"
            value={lineForm.quantity}
            onChange={(e) => setLineForm({ ...lineForm, quantity: Number(e.target.value) })}
            required
          />

          <Select
            label="Target Storage Location"
            value={lineForm.destLocationId}
            onChange={(e) => setLineForm({ ...lineForm, destLocationId: e.target.value })}
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} [{l.shortCode}]
              </option>
            ))}
          </Select>
        </form>
      </Modal>
    </div>
  );
}
